from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
from app.models.lease import BillingCycle, ContractStatus, LeaseEventType, DamageSeverity


class LeaseContractCreate(BaseModel):
    equipment_id: str
    customer_name: str
    customer_email: str
    customer_phone: str | None = None
    service_address: str
    start_date: date
    end_date: date
    monthly_rate: float
    billing_cycle: BillingCycle = BillingCycle.monthly
    status: ContractStatus = ContractStatus.pending
    auto_renew: bool = False
    special_terms: str | None = None

    @field_validator("monthly_rate")
    @classmethod
    def rate_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("monthly_rate must be greater than zero")
        return v

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v: date, info) -> date:
        start = info.data.get("start_date")
        if start and v <= start:
            raise ValueError("end_date must be after start_date")
        return v


class LeaseContractUpdate(BaseModel):
    customer_name: str | None = None
    customer_email: str | None = None
    customer_phone: str | None = None
    service_address: str | None = None
    end_date: date | None = None
    monthly_rate: float | None = None
    billing_cycle: BillingCycle | None = None
    status: ContractStatus | None = None
    auto_renew: bool | None = None
    special_terms: str | None = None


class LeaseEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    contract_id: str
    event_type: LeaseEventType
    scheduled_at: datetime
    completed_at: datetime | None
    driver_notes: str | None
    created_at: datetime


class LeaseEventCreate(BaseModel):
    event_type: LeaseEventType
    scheduled_at: datetime
    driver_notes: str | None = None


class DamageAssessmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    contract_id: str
    description: str
    severity: DamageSeverity
    repair_cost: float
    charged_to_customer: bool
    reported_at: datetime


class DamageAssessmentCreate(BaseModel):
    description: str
    severity: DamageSeverity
    repair_cost: float = 0.0
    charged_to_customer: bool = False

    @field_validator("repair_cost")
    @classmethod
    def cost_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("repair_cost cannot be negative")
        return v


class LeaseContractRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    equipment_id: str
    customer_name: str
    customer_email: str
    customer_phone: str | None
    service_address: str
    start_date: date
    end_date: date
    monthly_rate: float
    billing_cycle: BillingCycle
    status: ContractStatus
    auto_renew: bool
    special_terms: str | None
    created_at: datetime
    updated_at: datetime
    days_remaining: int | None = None

    def model_post_init(self, __context) -> None:
        from datetime import date as dt
        today = dt.today()
        if self.end_date >= today:
            object.__setattr__(self, "days_remaining", (self.end_date - today).days)
        else:
            object.__setattr__(self, "days_remaining", 0)


class LeaseContractList(BaseModel):
    items: list[LeaseContractRead]
    total: int
    limit: int
    offset: int
