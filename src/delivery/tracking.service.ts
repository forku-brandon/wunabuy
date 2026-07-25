/**
 * wunabuy — Tracking Service
 *
 * Handles live GPS tracking updates from transporters.
 * Each transporter sends periodic location updates.
 * Customers subscribe to order tracking via WebSocket to see live maps.
 */

import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// How often transporters should send location updates (meters / seconds)
const MIN_DISTANCE_UPDATE_METERS = 50;  // only record if moved >50m
const UPDATE_EXPIRY_MS = 30 * 1000;      // consider stale after 30s

export class TrackingService {
  /**
   * Record a transporter's location update
   */
  async recordLocation(
    transporterId: string,
    lat: number,
    lng: number,
    speed?: number
  ): Promise<{ orderId: string; status: string } | null> {
    // Find active delivery for this transporter
    const activeOrder = await prisma.order.findFirst({
      where: {
        transporterId,
        status: {
          in: [OrderStatus.DISPATCHED, OrderStatus.IN_TRANSIT]
        }
      },
      select: { id: true, status: true }
    });

    if (!activeOrder) return null;

    // Check if we should record (only if moved enough)
    const lastUpdate = await prisma.trackingUpdate.findFirst({
      where: { orderId: activeOrder.id },
      orderBy: { timestamp: 'desc' }
    });

    if (lastUpdate) {
      const distance = this.haversineDistance(
        Number(lastUpdate.lat),
        Number(lastUpdate.lng),
        lat,
        lng
      );
      if (distance < MIN_DISTANCE_UPDATE_METERS) return activeOrder;
    }

    await prisma.trackingUpdate.create({
      data: {
        orderId: activeOrder.id,
        lat,
        lng,
        speed,
        status: activeOrder.status,
        timestamp: new Date()
      }
    });

    // Also update transporter's current location
    await prisma.transporter.update({
      where: { userId: transporterId },
      data: { currentLat: lat, currentLng: lng }
    });

    return activeOrder;
  }

  /**
   * Get recent tracking history for an order
   */
  async getTrackingHistory(orderId: string, limit = 100) {
    const updates = await prisma.trackingUpdate.findMany({
      where: { orderId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
    return updates.reverse(); // chronological
  }

  /**
   * Get latest location for an order
   */
  async getLatestLocation(orderId: string) {
    const update = await prisma.trackingUpdate.findFirst({
      where: { orderId },
      orderBy: { timestamp: 'desc' }
    });

    if (!update) return null;

    const isStale = Date.now() - update.timestamp.getTime() > UPDATE_EXPIRY_MS;

    return {
      lat: Number(update.lat),
      lng: Number(update.lng),
      speed: update.speed,
      timestamp: update.timestamp,
      isStale
    };
  }

  /**
   * Get active transporters near a location (for assignment)
   */
  async getNearbyTransporters(lat: number, lng: number, radiusKm = 5) {
    // Approximate bounding box for the radius
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

    const transporters = await prisma.transporter.findMany({
      where: {
        isAvailable: true,
        currentLat: {
          gte: lat - latDelta,
          lte: lat + latDelta
        },
        currentLng: {
          gte: lng - lngDelta,
          lte: lng + lngDelta
        }
      },
      include: { user: { select: { fullName: true, phone: true } } },
      take: 20
    });

    // Filter by exact haversine distance
    return transporters
      .map(t => ({
        id: t.id,
        userId: t.userId,
        name: t.user.fullName,
        phone: t.user.phone,
        vehicleType: t.vehicleType,
        rating: t.rating,
        lat: Number(t.currentLat),
        lng: Number(t.currentLng),
        distance: this.haversineDistance(
          lat,
          lng,
          Number(t.currentLat),
          Number(t.currentLng)
        )
      }))
      .filter(t => t.distance <= radiusKm * 1000)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Haversine distance between two GPS coordinates in meters
   */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const trackingService = new TrackingService();
