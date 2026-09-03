import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { Modal } from '../components/ui/Modal';
import { DataTable, Column } from '../components/ui/DataTable';
import { useStaffAuth } from '../stores/staffAuthStore';
import {
  Truck,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  Radio,
  AlertTriangle,
  PhoneCall,
} from 'lucide-react';

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
  latitude: number;
  longitude: number;
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
    latitude: 4.051,
    longitude: 9.7679,
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
    latitude: 4.072,
    longitude: 9.7891,
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
    stage_name: 'Arrived at Destination',
    distance_km: 18.5,
    elapsed_mins: 45,
    status: 'delivered',
    latitude: 3.8667,
    longitude: 11.5167,
  },
];

export const LogisticsOpsPage: React.FC = () => {
  const { user, addAuditLog, hasPermission } = useStaffAuth();
  const [trips, setTrips] = useState<ActiveTripItem[]>(MOCK_ACTIVE_TRIPS);
  
  // Interactive Modals
  const [detailsTrip, setDetailsTrip] = useState<ActiveTripItem | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState<ActiveTripItem | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const canOverride = hasPermission('override_logistics');

  const handleManualOverride = () => {
    if (!overrideTarget || !overrideReason.trim()) return;

    addAuditLog({
      action_code: 'LOGISTICS_MANUAL_OVERRIDE',
      action_description: `Staff overrode dispatch status for ${overrideTarget.trip_code}. Reason: ${overrideReason}`,
      target_id: overrideTarget.id,
      security_level: 'WARNING',
    });

    setTrips((prev) =>
      prev.map((t) => (t.id === overrideTarget.id ? { ...t, stage: 4, stage_name: 'Staff Override Completed' } : t))
    );

    setOverrideModalOpen(false);
    setOverrideReason('');
    setOverrideTarget(null);
  };

  const columns: Column<ActiveTripItem>[] = [
    {
      key: 'trip_code',
      header: 'Trip Code',
      render: (item) => <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{item.trip_code}</span>,
    },
    {
      key: 'driver_name',
      header: 'Transporter Driver',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.driver_name}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.driver_vehicle}</span>
        </div>
      ),
    },
    {
      key: 'store_name',
      header: 'Store Pickup',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.store_name}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Hub: {item.pickup_quarter}</span>
        </div>
      ),
    },
    {
      key: 'buyer_name',
      header: 'Buyer Quarter',
      render: (item) => (
        <div>
          <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.buyer_name}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Quarter: {item.delivery_quarter}</span>
        </div>
      ),
    },
    {
      key: 'stage_name',
      header: 'Current Stage',
      render: (item) => (
        <Badge variant={item.stage === 4 ? 'success' : item.stage === 3 ? 'teal' : 'amber'}>
          Stage {item.stage}: {item.stage_name}
        </Badge>
      ),
    },
    {
      key: 'distance_km',
      header: 'Distance / Elapsed',
      render: (item) => (
        <div>
          <span className="block font-bold text-slate-900 dark:text-slate-100">{item.distance_km} km</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.elapsed_mins} mins elapsed</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDetailsTrip(item)}
          >
            <Navigation className="w-3.5 h-3.5 mr-1 text-slate-500 dark:text-slate-400" />
            Details
          </Button>

          {canOverride && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setOverrideTarget(item);
                setOverrideModalOpen(true);
              }}
            >
              Override
            </Button>
          )}
        </div>
      ),
    },
  ];

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
          icon={<Radio className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
          iconBg="bg-teal-50 dark:bg-teal-950/60"
          description="Live WebSocket GPS telemetry active"
        />

        <StatCard
          title="PACKAGES EN-ROUTE"
          value="28 Active Trips"
          change="Avg. 24 mins"
          changeType="neutral"
          icon={<Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-50 dark:bg-blue-950/60"
          description="Parcel dispatch in progress"
        />

        <StatCard
          title="DISPATCH SUCCESS RATE"
          value="98.6%"
          change="Last 7 Days"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/60"
          description="Verified POD signature confirmation"
        />

        <StatCard
          title="ACTIVE EMERGENCY SOS"
          value="0 Incidents"
          change="Normal Node"
          changeType="positive"
          icon={<ShieldAlert className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
          iconBg="bg-slate-100 dark:bg-slate-800"
          description="Zero rider distress signals active"
        />
      </div>

      {/* Advanced Reusable DataTable */}
      <DataTable
        data={trips}
        columns={columns}
        searchPlaceholder="Search trip code, driver, store name, or quarter..."
        pageSize={5}
        emptyMessage="No active delivery trips found."
      />

      {/* TRIP DETAILS & LIVE GPS TELEMETRY MODAL */}
      {detailsTrip && (
        <Modal isOpen={Boolean(detailsTrip)} onClose={() => setDetailsTrip(null)} title={`Live Trip Telemetry — ${detailsTrip.trip_code}`}>
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">DRIVER VEHICLE</span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{detailsTrip.driver_name}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">{detailsTrip.driver_vehicle}</p>
              </div>
              <a href={`tel:${detailsTrip.driver_phone}`} className="px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center space-x-1.5 hover:bg-slate-800 transition-colors">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">STORE PICKUP LOCATION</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{detailsTrip.store_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{detailsTrip.pickup_quarter}, Douala</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">BUYER DELIVERY DESTINATION</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{detailsTrip.buyer_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{detailsTrip.delivery_quarter}, Douala</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">GPS SPATIAL TELEMETRY</span>
              <p className="font-mono text-xs text-slate-900 dark:text-slate-100 font-bold mt-0.5">
                Lat: {detailsTrip.latitude.toFixed(4)}, Lng: {detailsTrip.longitude.toFixed(4)} • Speed: 32 km/h
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setDetailsTrip(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MANUAL OVERRIDE CONFIRMATION MODAL */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title={`Logistics Manual Override — ${overrideTarget?.trip_code}`}
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" />
            <div className="text-slate-700 dark:text-slate-300">
              <p className="font-bold">Staff Operational Intervention</p>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400 font-medium">
                Overriding this delivery trip will mark the package as verified delivered in the system ledger under staff record ({user?.employee_id}).
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Mandatory Override Reason &amp; Dispatch Notes *
            </label>
            <textarea
              rows={3}
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Specify operational reason (e.g. Phone loss confirmed by merchant)..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
