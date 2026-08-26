/**
 * Calculate the distance between two GPS coordinates using the Haversine formula.
 * @returns Distance in kilometers, rounded to 1 decimal place.
 * @example
 * calculateDistance(4.0510, 9.7679, 4.0611, 9.7863) // 2.1
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) return 0;

  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  
  return Math.round(d * 10) / 10;
}

/**
 * Format a distance value for display.
 * @example
 * formatDistance(0.3) // '300 m'
 * formatDistance(2.4) // '2.4 km'
 * formatDistance(15.0) // '15 km'
 */
export function formatDistance(km: number): string {
  if (typeof km !== 'number' || isNaN(km)) return '0 km';
  
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  
  return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
}
