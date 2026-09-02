import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  Truck,
  MapPin,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle2,
  Navigation,
  Radio,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { formatXAF } from '@wunabuy/utils';

interface ActiveTripItem {
  id: string;
  trip_code: string;
  driver_name: string;
  driver_phone: string;
  driver_vehicle: string;
  store_name: string;
  pickup_quarter: string;
  buyer_name: string;
  delivery_quarter: string;
  delivery_fee: number;
  stage: 1 | 2 | 3 | 4;
  stage_name: string;
  distance_km: number;
  elapsed_mins: number;
  status: 'en_route' | 'picked_up' | 'delivered' | 'sos';
}

const MOCK_ACTIVE_TRIPS: ActiveTripItem[] = [
  {
    id: 'trip_101',
    trip_code: 'WB-TRIP-9842',
    driver_name: 'Jean-Paul Nkoum',
    driver_phone: '+237 670 112 233',
    driver_vehicle: 'Yamaha Crux 110cc (Bike 🏍️)',
    store_name: 'Douala Tech Hub',
    pickup_quarter: 'Akwa',
    buyer_name: 'Amadou Bello',
    delivery_quarter: 'Bonanjo',
    delivery_fee: 1500,
    stage: 3,
    stage_name: 'En Route to Buyer',
    distance_km: 2.4,
    elapsed_mins: 14,
    status: 'en_route',
  },
  {
    id: 'trip_102',
    trip_code: 'WB-TRIP-9843',
    driver_name: 'Samuel Ebobe',
    driver_phone: '+237 699 443 322',
    driver_vehicle: 'Toyota Yaris (Taxi 🚕)',
    store_name: 'Heritage African Couture',
    pickup_quarter: 'Makepe',
    buyer_name: 'Chantal Ngo',
    delivery_quarter: 'Bonamoussadi',
    delivery_fee: 2500,
    stage: 2,
    stage_name: 'Package Picked Up (QR Verified)',
    distance_km: 4.8,
    elapsed_mins: 22,
    status: 'picked_up',
  },
  {
    id: 'trip_103',
    trip_code: 'WB-TRIP-9844',
    driver_name: 'Alain Tchakounte',
    driver_phone: '+237 675 889 900',
    driver_vehicle: 'Suzuki Carry (Van 🚐)',
    store_name: 'Kilo Shop Bonapriso',
    pickup_quarter: 'Bonapriso',
    buyer_name: 'Pauline Mbarga',
    delivery_quarter: 'Bastos (Yaoundé Hub)',
    delivery_fee: 8500,
    stage: 4,
    stage_name: 'Arrived at Destination (Awaiting Signature)',
    distance_km: 18.5,
    elapsed_mins: 45,
    status: 'delivered',
  },
];

export const LogisticsOpsPage: React.FC = () => {
  const { user, addAuditLog, hasPermission } = useStaffAuth();
  const [trips, setTrips] = useState<ActiveTripItem[]>(MOCK_ACTIVE_TRIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<ActiveTripItem | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const canOverride = hasPermission('override_logistics');

  const filteredTrips = trips.filter(
    (t) =>
      t.trip_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.store_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManualOverride = () => {
    if (!selectedTrip || !overrideReason.trim()) return;

    addAuditLog({
      action_code: 'LOGISTICS_MANUAL_OVERRIDE',
      action_description: `Staff overrode dispatch status for ${selectedTrip.trip_code}. Reason: ${overrideReason}`,
      target_id: selectedTrip.id,
      security_level: 'WARNING',
    });

    setTrips((prev) =>
      prev.map((t) => (t.id === selectedTrip.id ? { ...t, stage: 4, stage_name: 'Staff Override Completed' } : t))
    );

    setOverrideModalOpen(false);
    setOverrideReason('');
    setSelectedTrip(null);
  };

  return (
    <PageContainer
      title="Operations & Logistics Telemetry Center"
      subtitle="Real-time Transporter GPS Location Broadcasting, Package Dispatch Monitoring & Emergency Controls"
    >
      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="ACTIVE ON-DUTY RIDERS"
          value="48 Drivers"
          change="Douala & Yaoundé"
          changeType="positive"
          icon={<Radio className="w-5 h-5 text-teal-600" />}
          description="Live WebSocket GPS telemetry active"
        />

        <StatCard
          title="PACKAGES EN-ROUTE"
          value="28 Active Trips"
          change="Avg. 24 mins"
          changeType="neutral"
          icon={<Truck className="w-5 h-5 text-blue-600" />}
          description="Parcel dispatch in progress"
        />

        <StatCard
          title="DISPATCH SUCCESS RATE"
          value="98.6%"
          change="Last 7 Days"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description="Verified POD signature confirmation"
        />

        <StatCard
          title="ACTIVE EMERGENCY SOS"
          value="0 Incidents"
          change="Normal Node"
          changeType="positive"
          icon={<ShieldAlert className="w-5 h-5 text-slate-400" />}
          description="Zero rider distress signals active"
        />
      </div>

      {/* Live Active Trips Telemetry Table */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Live Delivery Trips Telemetry
            </h3>
            <p className="text-xs text-slate-500">Real-time stage tracking &amp; spatial distance monitoring</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by trip code, driver, or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Trip Code</th>
                <th className="py-3 px-4">Transporter Driver</th>
                <th className="py-3 px-4">Store Pickup</th>
                <th className="py-3 px-4">Buyer Quarter</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">Distance / Elapsed</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{trip.trip_code}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{trip.driver_name}</span>
                    <span className="text-[11px] text-slate-500">{trip.driver_vehicle}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold block">{trip.store_name}</span>
                    <span className="text-[11px] text-slate-400">Hub: {trip.pickup_quarter}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold block">{trip.buyer_name}</span>
                    <span className="text-[11px] text-slate-400">Quarter: {trip.delivery_quarter}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={trip.stage === 4 ? 'success' : trip.stage === 3 ? 'teal' : 'amber'}>
                      Stage {trip.stage}: {trip.stage_name}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="block font-semibold">{trip.distance_km} km</span>
                    <span className="text-[11px] text-slate-400">{trip.elapsed_mins} mins elapsed</span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTrip(trip);
                      }}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>

                    {canOverride && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedTrip(trip);
                          setOverrideModalOpen(true);
                        }}
                      >
                        Override
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Override Confirmation Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title={`Logistics Manual Override — ${selectedTrip?.trip_code}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold">Staff Operational Intervention</p>
              <p className="mt-0.5">
                Overriding this delivery trip will mark the package as verified delivered in the system ledger. This action will be permanently logged under your staff employee record ({user?.employee_id}).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mandatory Override Reason &amp; Dispatch Notes *
            </label>
            <textarea
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Specify operational reason (e.g. Phone loss confirmed by merchant, manual paper proof-of-delivery verified)..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!overrideReason.trim()} onClick={handleManualOverride}>
              Confirm Override &amp; Record Audit Log
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};
