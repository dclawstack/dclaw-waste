import logging
import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.repositories.lease_repo import LeaseRepository
from app.repositories.equipment_repo import EquipmentRepository
from app.repositories.waste_repo import WasteRecordRepository
from app.repositories.schedule_repo import ScheduleRepository
from app.models.lease import ContractStatus
from app.models.equipment import EquipmentStatus
from datetime import date

logger = logging.getLogger(__name__)
router = APIRouter()

SYSTEM_PROMPT = """You are the DClaw Waste AI Copilot — a helpful assistant embedded in a waste management platform.
You help operations teams manage equipment leases, track waste streams, schedule collections, and optimize sustainability performance.
Be concise, actionable, and domain-specific. If you don't know something, say so clearly."""


class ChatMessage(BaseModel):
    message: str
    page_context: str | None = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = []


async def _build_context(db: AsyncSession) -> str:
    """Build a short live data summary to inject into the copilot prompt."""
    try:
        lease_repo = LeaseRepository(db)
        equip_repo = EquipmentRepository(db)
        sched_repo = ScheduleRepository(db)

        active_leases = await lease_repo.count_by_status(ContractStatus.active)
        expiring = await lease_repo.count_expiring_soon(30)
        available = await equip_repo.count_by_status(EquipmentStatus.available)
        overdue = await sched_repo.count_overdue()
        today_jobs = await sched_repo.count_for_date(date.today())

        return (
            f"Live data snapshot: {active_leases} active leases, {expiring} expiring within 30 days, "
            f"{available} equipment units available, {today_jobs} jobs scheduled today, {overdue} overdue pickups."
        )
    except Exception as exc:
        logger.warning("Could not build copilot context: %s", exc)
        return ""


def _rule_based_reply(message: str, context: str) -> ChatResponse:
    """Fallback when no API key is configured."""
    msg = message.lower()
    if any(w in msg for w in ["expir", "renew", "contract"]):
        return ChatResponse(
            reply=f"Based on current data: {context}\n\nReview contracts expiring within 30 days in the Leases section and use the Renew button.",
            suggestions=["View expiring leases", "Filter leases by status: active"],
        )
    if any(w in msg for w in ["equipment", "available", "container", "compactor"]):
        return ChatResponse(
            reply=f"Equipment status: {context}\n\nCheck the Equipment page for available units by type.",
            suggestions=["View available equipment", "Add new equipment"],
        )
    if any(w in msg for w in ["schedule", "pickup", "job", "overdue"]):
        return ChatResponse(
            reply=f"Schedule snapshot: {context}\n\nOverdue pickups should be rescheduled from the Schedule page.",
            suggestions=["View today's jobs", "View overdue pickups"],
        )
    if any(w in msg for w in ["waste", "diversion", "recycle", "landfill"]):
        return ChatResponse(
            reply="Track waste generation in the Waste Log. The Summary tab shows your diversion rate by stream.",
            suggestions=["Log waste record", "View waste summary"],
        )
    return ChatResponse(
        reply=f"I'm your DClaw Waste Copilot. {context}\n\nI can help with leases, equipment, scheduling, and waste tracking. What would you like to know?",
        suggestions=["Show active leases", "What equipment is available?", "How many jobs today?"],
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatMessage, db: AsyncSession = Depends(get_db)):
    context = await _build_context(db)
    full_message = payload.message
    if payload.page_context:
        full_message = f"[Page context: {payload.page_context}]\n\n{payload.message}"

    if not settings.openrouter_api_key:
        return _rule_based_reply(payload.message, context)

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.openrouter_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.openrouter_model,
                    "messages": [
                        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context}"},
                        {"role": "user", "content": full_message},
                    ],
                    "max_tokens": 400,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=reply)
    except Exception as exc:
        logger.warning("OpenRouter call failed, using fallback: %s", exc)
        return _rule_based_reply(payload.message, context)
