import uuid
import logging
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.invoice import Invoice, InvoiceStatus
from app.models.lease import LeaseContract
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceRead, InvoiceList

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_or_404(inv_id: str, db: AsyncSession) -> Invoice:
    result = await db.execute(select(Invoice).where(Invoice.id == inv_id))
    inv = result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


@router.get("/", response_model=InvoiceList)
async def list_invoices(
    contract_id: str | None = Query(None),
    status: InvoiceStatus | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    q = select(Invoice)
    cq = select(func.count()).select_from(Invoice)
    if contract_id:
        q = q.where(Invoice.contract_id == contract_id)
        cq = cq.where(Invoice.contract_id == contract_id)
    if status:
        q = q.where(Invoice.status == status)
        cq = cq.where(Invoice.status == status)
    items = list((await db.execute(q.order_by(Invoice.created_at.desc()).limit(limit).offset(offset))).scalars().all())
    total = (await db.execute(cq)).scalar() or 0
    return InvoiceList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=InvoiceRead, status_code=201)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    total = round(payload.base_amount + payload.damage_charges, 2)
    inv = Invoice(id=str(uuid.uuid4()), total=total, **payload.model_dump())
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    return inv


@router.post("/generate/{contract_id}", response_model=InvoiceRead, status_code=201)
async def generate_invoice(contract_id: str, db: AsyncSession = Depends(get_db)):
    """Auto-generate a draft invoice for the current period of a lease contract."""
    result = await db.execute(select(LeaseContract).where(LeaseContract.id == contract_id))
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")

    today = date.today()
    period_start = today.replace(day=1)
    # last day of month
    next_month = (period_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    period_end = next_month - timedelta(days=1)
    due_date = next_month + timedelta(days=14)

    base_amount = float(contract.monthly_rate)
    inv = Invoice(
        id=str(uuid.uuid4()),
        contract_id=contract_id,
        period_start=period_start,
        period_end=period_end,
        base_amount=base_amount,
        damage_charges=0,
        total=base_amount,
        status=InvoiceStatus.draft,
        due_date=due_date,
        notes=f"Auto-generated for {period_start} – {period_end}",
    )
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    logger.info("Generated invoice %s for contract %s", inv.id, contract_id)
    return inv


@router.get("/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(invoice_id, db)


@router.put("/{invoice_id}", response_model=InvoiceRead)
async def update_invoice(invoice_id: str, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db)):
    inv = await _get_or_404(invoice_id, db)
    for k, v in payload.model_dump().items():
        if v is not None:
            setattr(inv, k, v)
    if payload.damage_charges is not None:
        inv.total = round(float(inv.base_amount) + float(inv.damage_charges), 2)
    await db.commit()
    await db.refresh(inv)
    return inv


@router.post("/{invoice_id}/pay", response_model=InvoiceRead)
async def mark_paid(invoice_id: str, db: AsyncSession = Depends(get_db)):
    inv = await _get_or_404(invoice_id, db)
    inv.status = InvoiceStatus.paid
    await db.commit()
    await db.refresh(inv)
    return inv


@router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    inv = await _get_or_404(invoice_id, db)
    await db.delete(inv)
    await db.commit()


# ── Stripe payment link ───────────────────────────────────────────────────────

class PaymentLinkResponse(BaseModel):
    payment_url: str
    invoice_id: str
    is_demo: bool


@router.post("/{invoice_id}/payment-link", response_model=PaymentLinkResponse)
async def create_payment_link(invoice_id: str, db: AsyncSession = Depends(get_db)):
    from app.core.config import settings
    inv = await _get_or_404(invoice_id, db)

    is_demo = True
    if settings.stripe_api_key:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.stripe.com/v1/checkout/sessions",
                    auth=(settings.stripe_api_key, ""),
                    data={
                        "mode": "payment",
                        "line_items[0][price_data][currency]": "usd",
                        "line_items[0][price_data][unit_amount]": str(int(float(inv.total) * 100)),
                        "line_items[0][price_data][product_data][name]": f"Invoice {invoice_id[:8]} — Waste Lease",
                        "line_items[0][quantity]": "1",
                        "success_url": settings.stripe_success_url,
                        "cancel_url": settings.stripe_cancel_url,
                    },
                )
                if resp.status_code == 200:
                    session = resp.json()
                    payment_url = session["url"]
                    inv.stripe_session_id = session["id"]
                    inv.payment_url = payment_url
                    inv.status = InvoiceStatus.sent
                    await db.commit()
                    is_demo = False
                    return PaymentLinkResponse(payment_url=payment_url, invoice_id=invoice_id, is_demo=False)
        except Exception as e:
            logger.warning("Stripe call failed: %s", e)

    # Demo / fallback payment link
    demo_url = f"https://buy.stripe.com/demo?invoice={invoice_id}&amount={inv.total}"
    inv.payment_url = demo_url
    inv.status = InvoiceStatus.sent
    await db.commit()
    return PaymentLinkResponse(payment_url=demo_url, invoice_id=invoice_id, is_demo=True)
