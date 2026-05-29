"""
Carbon emission factor calculator using EPA WARM model approximations.
Units: kg CO₂e per kg waste. Negative values = emissions avoided (credit).
"""
from dataclasses import dataclass

# EPA WARM model factors (kg CO₂e per kg waste)
# Source: EPA WARM v15 — simplified for common waste types
_FACTORS: dict[tuple[str, str], float] = {
    ("general",      "landfill"):   0.49,
    ("general",      "incinerate"): 0.42,
    ("general",      "recycle"):    -0.10,
    ("recyclable",   "landfill"):   0.49,
    ("recyclable",   "recycle"):    -0.33,
    ("recyclable",   "incinerate"): 0.32,
    ("organic",      "landfill"):   0.65,   # higher due to methane
    ("organic",      "compost"):    -0.18,
    ("organic",      "incinerate"): 0.38,
    ("hazardous",    "landfill"):   0.85,
    ("hazardous",    "incinerate"): 0.52,
    ("e_waste",      "landfill"):   0.49,
    ("e_waste",      "recycle"):    -0.95,  # significant savings
    ("construction", "landfill"):   0.22,
    ("construction", "reuse"):      -0.12,
    ("construction", "recycle"):    -0.08,
    ("construction", "incinerate"): 0.38,
}
_DEFAULT_FACTOR = 0.40  # fallback for unknown combinations


@dataclass
class EmissionLine:
    waste_type: str
    diversion_method: str
    weight_kg: float
    factor: float
    co2e_kg: float


def calculate_emission(waste_type: str, diversion_method: str, weight_kg: float) -> EmissionLine:
    factor = _FACTORS.get((waste_type, diversion_method), _DEFAULT_FACTOR)
    return EmissionLine(
        waste_type=waste_type,
        diversion_method=diversion_method,
        weight_kg=weight_kg,
        factor=factor,
        co2e_kg=round(weight_kg * factor, 3),
    )
