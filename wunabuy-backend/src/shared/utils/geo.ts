/** Haversine distance in km */
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** Location score: 1.0 at 0km, decays to 0 at maxDistanceKm */
export function locationScore(distanceKm: number, maxDistanceKm: number = 50): number {
  if (distanceKm >= maxDistanceKm) return 0;
  return 1 - (distanceKm / maxDistanceKm);
}
