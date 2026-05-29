const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new ApiError(`${resp.status}: ${text}`, resp.status);
  }
  return resp.json();
}

// ── Health ───────────────────────────────────────────────────────────────────
export const getHealth = () => fetchJson<{ status: string }>("/health/");

// ── Dashboard ────────────────────────────────────────────────────────────────
export type DashboardStats = {
  total_equipment: number; available_equipment: number;
  active_leases: number; expiring_soon: number;
  total_sites: number; total_waste_kg: number;
  diversion_rate_pct: number; jobs_today: number; jobs_overdue: number;
};
export const getDashboard = () => fetchJson<DashboardStats>("/api/v1/dashboard/");

// ── Equipment ────────────────────────────────────────────────────────────────
export type EquipmentType = "roll_off" | "compactor" | "baler" | "dumpster" | "cart";
export type EquipmentStatus = "available" | "deployed" | "maintenance" | "retired";
export type Equipment = {
  id: string; serial_number: string; equipment_type: EquipmentType;
  capacity_yards: number | null; status: EquipmentStatus;
  location_address: string | null; purchase_date: string | null;
  notes: string | null; created_at: string; updated_at: string;
};
export type EquipmentList = { items: Equipment[]; total: number; limit: number; offset: number };
export type EquipmentCreate = Omit<Equipment, "id" | "created_at" | "updated_at">;

export const listEquipment = (params?: Record<string, string>) =>
  fetchJson<EquipmentList>(`/api/v1/equipment/?${new URLSearchParams(params)}`);
export const getEquipment = (id: string) => fetchJson<Equipment>(`/api/v1/equipment/${id}`);
export const createEquipment = (data: Partial<EquipmentCreate>) =>
  fetchJson<Equipment>("/api/v1/equipment/", { method: "POST", body: JSON.stringify(data) });
export const updateEquipment = (id: string, data: Partial<EquipmentCreate>) =>
  fetchJson<Equipment>(`/api/v1/equipment/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteEquipment = (id: string) =>
  fetch(`${API_BASE}/api/v1/equipment/${id}`, { method: "DELETE" });

// ── Leases ───────────────────────────────────────────────────────────────────
export type ContractStatus = "pending" | "active" | "expired" | "terminated";
export type BillingCycle = "monthly" | "quarterly" | "annual";
export type LeaseContract = {
  id: string; equipment_id: string; customer_name: string; customer_email: string;
  customer_phone: string | null; service_address: string; start_date: string; end_date: string;
  monthly_rate: number; billing_cycle: BillingCycle; status: ContractStatus;
  auto_renew: boolean; special_terms: string | null; days_remaining: number | null;
  created_at: string; updated_at: string;
};
export type LeaseList = { items: LeaseContract[]; total: number; limit: number; offset: number };
export type LeaseEventType = "delivery" | "pickup" | "swap" | "maintenance_call" | "damage_report" | "inspection";
export type LeaseEvent = {
  id: string; contract_id: string; event_type: LeaseEventType;
  scheduled_at: string; completed_at: string | null; driver_notes: string | null; created_at: string;
};
export type DamageSeverity = "minor" | "moderate" | "severe";
export type DamageAssessment = {
  id: string; contract_id: string; description: string; severity: DamageSeverity;
  repair_cost: number; charged_to_customer: boolean; reported_at: string;
};

export const listLeases = (params?: Record<string, string>) =>
  fetchJson<LeaseList>(`/api/v1/leases/?${new URLSearchParams(params)}`);
export const getLease = (id: string) => fetchJson<LeaseContract>(`/api/v1/leases/${id}`);
export const createLease = (data: Partial<LeaseContract>) =>
  fetchJson<LeaseContract>("/api/v1/leases/", { method: "POST", body: JSON.stringify(data) });
export const updateLease = (id: string, data: Partial<LeaseContract>) =>
  fetchJson<LeaseContract>(`/api/v1/leases/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const renewLease = (id: string) =>
  fetchJson<LeaseContract>(`/api/v1/leases/${id}/renew`, { method: "POST" });
export const deleteLease = (id: string) =>
  fetch(`${API_BASE}/api/v1/leases/${id}`, { method: "DELETE" });
export const getLeaseEvents = (id: string) => fetchJson<LeaseEvent[]>(`/api/v1/leases/${id}/events`);
export const addLeaseEvent = (id: string, data: { event_type: LeaseEventType; scheduled_at: string; driver_notes?: string }) =>
  fetchJson<LeaseEvent>(`/api/v1/leases/${id}/events`, { method: "POST", body: JSON.stringify(data) });
export const getLeiseDamages = (id: string) => fetchJson<DamageAssessment[]>(`/api/v1/leases/${id}/damages`);
export const addDamage = (id: string, data: { description: string; severity: DamageSeverity; repair_cost: number }) =>
  fetchJson<DamageAssessment>(`/api/v1/leases/${id}/damages`, { method: "POST", body: JSON.stringify(data) });

// ── Sites ────────────────────────────────────────────────────────────────────
export type SiteType = "office" | "warehouse" | "restaurant" | "retail" | "construction" | "industrial";
export type Site = {
  id: string; name: string; address: string; site_type: SiteType;
  customer_name: string; active: boolean; created_at: string; updated_at: string;
};
export type SiteList = { items: Site[]; total: number; limit: number; offset: number };

export const listSites = (params?: Record<string, string>) =>
  fetchJson<SiteList>(`/api/v1/sites/?${new URLSearchParams(params)}`);
export const getSite = (id: string) => fetchJson<Site>(`/api/v1/sites/${id}`);
export const createSite = (data: Partial<Site>) =>
  fetchJson<Site>("/api/v1/sites/", { method: "POST", body: JSON.stringify(data) });
export const updateSite = (id: string, data: Partial<Site>) =>
  fetchJson<Site>(`/api/v1/sites/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSite = (id: string) =>
  fetch(`${API_BASE}/api/v1/sites/${id}`, { method: "DELETE" });

// ── Waste Records ────────────────────────────────────────────────────────────
export type WasteType = "general" | "recyclable" | "organic" | "hazardous" | "e_waste" | "construction";
export type DiversionMethod = "landfill" | "recycle" | "compost" | "incinerate" | "reuse" | "donate";
export type WasteRecord = {
  id: string; site_id: string; waste_type: WasteType; weight_kg: number;
  volume_liters: number | null; diversion_method: DiversionMethod;
  notes: string | null; recorded_at: string; created_at: string;
};
export type WasteList = { items: WasteRecord[]; total: number; limit: number; offset: number };
export type WasteSummary = {
  total_weight_kg: number; by_type: Record<string, number>;
  by_diversion: Record<string, number>; diversion_rate_pct: number;
};

export const listWasteRecords = (params?: Record<string, string>) =>
  fetchJson<WasteList>(`/api/v1/waste/?${new URLSearchParams(params)}`);
export const createWasteRecord = (data: Partial<WasteRecord>) =>
  fetchJson<WasteRecord>("/api/v1/waste/", { method: "POST", body: JSON.stringify(data) });
export const getWasteSummary = (siteId?: string) =>
  fetchJson<WasteSummary>(`/api/v1/waste/summary${siteId ? `?site_id=${siteId}` : ""}`);
export const deleteWasteRecord = (id: string) =>
  fetch(`${API_BASE}/api/v1/waste/${id}`, { method: "DELETE" });

// ── Schedule ─────────────────────────────────────────────────────────────────
export type JobType = "regular_collection" | "delivery" | "swap" | "pickup" | "emergency";
export type TimeWindow = "morning" | "afternoon" | "anytime";
export type JobStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type CollectionJob = {
  id: string; site_id: string; contract_id: string | null; job_type: JobType;
  scheduled_date: string; time_window: TimeWindow; status: JobStatus;
  driver_notes: string | null; completed_at: string | null; created_at: string; updated_at: string;
};
export type JobList = { items: CollectionJob[]; total: number; limit: number; offset: number };

export const listJobs = (params?: Record<string, string>) =>
  fetchJson<JobList>(`/api/v1/schedule/?${new URLSearchParams(params)}`);
export const createJob = (data: Partial<CollectionJob>) =>
  fetchJson<CollectionJob>("/api/v1/schedule/", { method: "POST", body: JSON.stringify(data) });
export const completeJob = (id: string) =>
  fetchJson<CollectionJob>(`/api/v1/schedule/${id}/complete`, { method: "POST" });
export const deleteJob = (id: string) =>
  fetch(`${API_BASE}/api/v1/schedule/${id}`, { method: "DELETE" });

// ── Copilot ──────────────────────────────────────────────────────────────────
export type CopilotResponse = { reply: string; suggestions: string[] };
export const chatWithCopilot = (message: string, page_context?: string) =>
  fetchJson<CopilotResponse>("/api/v1/copilot/chat", {
    method: "POST",
    body: JSON.stringify({ message, page_context }),
  });

// ── Classify ──────────────────────────────────────────────────────────────────
export type ClassifyResult = { waste_type: string; diversion_method: string; confidence: string; reasoning: string };
export const classifyWaste = (description: string) =>
  fetchJson<ClassifyResult>("/api/v1/waste/classify", { method: "POST", body: JSON.stringify({ description }) });

// ── Anomalies ─────────────────────────────────────────────────────────────────
export type AnomalyRecord = { record_id: string; site_id: string; waste_type: string; weight_kg: number; mean_kg: number; std_dev_kg: number; z_score: number; recorded_at: string };
export const getAnomalies = (siteId?: string) =>
  fetchJson<AnomalyRecord[]>(`/api/v1/waste/anomalies${siteId ? `?site_id=${siteId}` : ""}`);

// ── Vendor ────────────────────────────────────────────────────────────────────
export type VendorType = "hauler" | "recycler" | "processor" | "broker";
export type Vendor = {
  id: string; name: string; vendor_type: VendorType; service_areas: string;
  accepted_waste_types: string; rate_per_ton: number | null;
  contact_name: string | null; contact_email: string | null; contact_phone: string | null;
  active: boolean; performance_score: number;
  created_at: string; updated_at: string;
};
export type VendorList = { items: Vendor[]; total: number; limit: number; offset: number };
export const listVendors = (params?: Record<string, string>) =>
  fetchJson<VendorList>(`/api/v1/vendors/?${new URLSearchParams(params)}`);
export const createVendor = (data: Partial<Vendor>) =>
  fetchJson<Vendor>("/api/v1/vendors/", { method: "POST", body: JSON.stringify(data) });
export const updateVendor = (id: string, data: Partial<Vendor>) =>
  fetchJson<Vendor>(`/api/v1/vendors/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVendor = (id: string) =>
  fetch(`${API_BASE}/api/v1/vendors/${id}`, { method: "DELETE" });

// ── Carbon ────────────────────────────────────────────────────────────────────
export type CarbonReport = {
  total_co2e_kg: number; avoided_co2e_kg: number; net_co2e_kg: number;
  by_stream: Array<{ waste_type: string; diversion_method: string; weight_kg: number; co2e_kg: number; factor: number }>;
  scope3_classification: string;
};
export const getCarbonReport = (siteId?: string) =>
  fetchJson<CarbonReport>(`/api/v1/carbon/report${siteId ? `?site_id=${siteId}` : ""}`);

// ── Invoices ──────────────────────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";
export type Invoice = {
  id: string; contract_id: string; period_start: string; period_end: string;
  base_amount: number; damage_charges: number; total: number;
  status: InvoiceStatus; due_date: string; notes: string | null;
  created_at: string;
};
export type InvoiceList = { items: Invoice[]; total: number; limit: number; offset: number };
export const listInvoices = (params?: Record<string, string>) =>
  fetchJson<InvoiceList>(`/api/v1/invoices/?${new URLSearchParams(params)}`);
export const createInvoice = (data: Partial<Invoice>) =>
  fetchJson<Invoice>("/api/v1/invoices/", { method: "POST", body: JSON.stringify(data) });
export const markInvoicePaid = (id: string) =>
  fetchJson<Invoice>(`/api/v1/invoices/${id}/pay`, { method: "POST" });
export const deleteInvoice = (id: string) =>
  fetch(`${API_BASE}/api/v1/invoices/${id}`, { method: "DELETE" });
export const generateInvoicesForContract = (contractId: string) =>
  fetchJson<Invoice>(`/api/v1/invoices/generate/${contractId}`, { method: "POST" });

// ── Hazmat ────────────────────────────────────────────────────────────────────
export type HazmatStatus = "pending" | "manifested" | "disposed" | "verified";
export type HazmatRecord = {
  id: string; site_id: string; waste_type_detail: string; un_number: string;
  hazard_class: string; quantity_kg: number; manifest_number: string | null;
  disposal_vendor_id: string | null; status: HazmatStatus;
  notes: string | null; recorded_at: string; created_at: string;
};
export type HazmatList = { items: HazmatRecord[]; total: number; limit: number; offset: number };
export const listHazmat = (params?: Record<string, string>) =>
  fetchJson<HazmatList>(`/api/v1/hazmat/?${new URLSearchParams(params)}`);
export const createHazmat = (data: Partial<HazmatRecord>) =>
  fetchJson<HazmatRecord>("/api/v1/hazmat/", { method: "POST", body: JSON.stringify(data) });
export const updateHazmat = (id: string, data: Partial<HazmatRecord>) =>
  fetchJson<HazmatRecord>(`/api/v1/hazmat/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteHazmat = (id: string) =>
  fetch(`${API_BASE}/api/v1/hazmat/${id}`, { method: "DELETE" });

// ── CSV helpers ───────────────────────────────────────────────────────────────
export function downloadCsv(path: string, filename: string) {
  const a = document.createElement("a")
  a.href = `${API_BASE}${path}`
  a.download = filename
  a.click()
}
