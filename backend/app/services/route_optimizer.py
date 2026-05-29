"""
Greedy nearest-neighbour TSP approximation for daily collection routes.
No external dependencies — pure Python.
Input: list of (job_id, lat, lng) tuples.
Output: ordered list of job_ids.
"""
import math
from typing import NamedTuple


class Stop(NamedTuple):
    job_id: str
    lat: float
    lng: float


def _distance(a: Stop, b: Stop) -> float:
    """Haversine distance in km."""
    R = 6371.0
    dlat = math.radians(b.lat - a.lat)
    dlng = math.radians(b.lng - a.lng)
    h = math.sin(dlat / 2) ** 2 + math.cos(math.radians(a.lat)) * math.cos(math.radians(b.lat)) * math.sin(dlng / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def optimize_route(stops: list[Stop]) -> list[str]:
    """Return job_ids in greedy nearest-neighbour order."""
    if len(stops) <= 1:
        return [s.job_id for s in stops]

    remaining = list(stops)
    ordered = [remaining.pop(0)]

    while remaining:
        current = ordered[-1]
        nearest = min(remaining, key=lambda s: _distance(current, s))
        ordered.append(nearest)
        remaining.remove(nearest)

    return [s.job_id for s in ordered]
