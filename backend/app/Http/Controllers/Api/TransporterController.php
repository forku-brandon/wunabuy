<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Transporter;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\KYCService;
use App\Services\LogisticsService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransporterController extends Controller
{
    public function __construct(
        protected LogisticsService $logisticsService,
        protected KYCService $kycService,
        protected PaymentService $paymentService
    ) {
    }

    /**
     * Get available delivery jobs for transporters.
     */
    public function getAvailableJobs(Request $request): JsonResponse
    {
        $orders = Order::with(['store', 'customer'])
            ->whereIn('status', ['ready_for_pickup', 'pending', 'preparing'])
            ->get();

        $jobs = [];
        foreach ($orders as $order) {
            $store = $order->store;
            $sLat = (float) ($store->latitude ?? 4.0510);
            $sLng = (float) ($store->longitude ?? 9.7678);

            $dAddress = $order->delivery_address ?? [];
            $dLat = (float) ($dAddress['latitude'] ?? 4.0611);
            $dLng = (float) ($dAddress['longitude'] ?? 9.7863);

            $distance = $this->logisticsService->calculateHaversineDistance($sLat, $sLng, $dLat, $dLng);

            $jobs[] = [
                'id' => 'job_' . substr($order->id, 0, 8),
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'store' => [
                    'id' => $store->id ?? 's_1',
                    'store_name' => $store->store_name ?? 'Merchant Store',
                    'rating_avg' => (float) ($store->rating_avg ?? 4.9),
                    'is_verified' => (bool) ($store->is_verified ?? true),
                ],
                'pickup_address' => [
                    'id' => 'p_' . substr($order->id, 0, 4),
                    'label' => 'Store Pickup',
                    'latitude' => $sLat,
                    'longitude' => $sLng,
                    'address_text' => $store->address_text ?? 'Rue Joss, Akwa, Douala',
                    'city' => 'Douala',
                    'is_default' => false,
                ],
                'delivery_address' => [
                    'id' => 'd_' . substr($order->id, 0, 4),
                    'label' => 'Buyer Location',
                    'latitude' => $dLat,
                    'longitude' => $dLng,
                    'address_text' => $dAddress['address_text'] ?? 'Boulevard de la LibertÃ©, Bonanjo, Douala',
                    'city' => 'Douala',
                    'is_default' => true,
                ],
                'items_summary' => '1x Wunabuy Verified Package',
                'delivery_fee' => (float) ($order->delivery_fee > 0 ? $order->delivery_fee : 1500),
                'currency' => 'XAF',
                'distance_km' => $distance > 0 ? $distance : 2.4,
                'status' => 'pending',
                'created_at' => $order->created_at?->toIso8601String() ?? now()->toIso8601String(),
            ];
        }


        return $this->respondPaginated($jobs, false, null, count($jobs));
    }

    /**
     * Accept delivery job.
     */
    public function acceptJob(string $id): JsonResponse
    {
        $user = $this->resolveUser(request());
        $transporter = $user?->transporter ?? Transporter::where('user_id', $user?->id)->first();

        // Assign transporter to first eligible order
        $order = Order::whereIn('status', ['ready_for_pickup', 'pending', 'preparing'])->first();
        if ($order && $transporter) {
            $order->transporter_id = $transporter->id;
            $order->status = 'in_transit';
            $order->save();
        }

        return $this->respondSuccess([
            'accepted' => true,
            'job_id' => $id,
            'status' => 'accepted',
        ]);
    }

    /**
     * Reject delivery job.
     */
    public function rejectJob(string $id): JsonResponse
    {
        return $this->respondSuccess(['rejected' => true, 'job_id' => $id]);
    }

    /**
     * Update transporter duty status (online/offline).
     */
    public function updateDutyStatus(Request $request): JsonResponse
    {
        $isOnDuty = (bool) $request->input('is_on_duty', true);
        $user = $this->resolveUser($request);
        $transporter = $user?->transporter ?? Transporter::where('user_id', $user?->id)->first();
        if ($transporter) {
            $transporter->is_online = $isOnDuty;
            $transporter->save();
        }

        return $this->respondSuccess(['is_on_duty' => $isOnDuty]);
    }

    /**
     * Get active trip details.
     */
    public function getActiveTrip(Request $request): JsonResponse
    {
        $jobId = $request->query('job_id', 'job_1');
        $order = Order::with(['store', 'customer'])->where('status', 'in_transit')->first() ?? Order::with(['store', 'customer'])->first();

        $store = $order?->store;
        $customer = $order?->customer;
        $dAddress = $order?->delivery_address ?? [];

        return $this->respondSuccess([
            'job_id' => $jobId,
            'order_code' => $order->order_code ?? 'WB-2026-9842',
            'current_stage' => 1,
            'verification_code' => $order->pickup_verification_pin ?? '7842',
            'delivery_fee' => (float) ($order->delivery_fee ?? 1500),
            'items_summary' => 'Samsung Galaxy A54 5G (128GB - Factory Sealed)',
            'package_specs' => 'Fragile Electronics â€¢ Small Box (< 2 kg)',
            'store_name' => $store->store_name ?? 'Douala Tech Hub (Akwa Branch)',
            'store_address' => $store->address_text ?? 'Rue Joss, Quartier Akwa, Douala, Cameroon',
            'store_landmark_directions' => 'Opposite Place du Gouvernement, Next to Akwa Mall (Suite 104)',
            'store_phone' => $store->phone ?? '+237 670 123 456',
            'store_operating_hours' => $store->counter_hours ?? 'Mon - Sat: 8:00 AM - 6:30 PM',
            'store_handover_instructions' => 'ðŸ”‘ Handover Code Verification: Present rider ID & ask merchant for the 4-digit pickup PIN upon parcel collection.',
            'buyer_name' => $customer->full_name ?? 'Marie Claire Ngono',
            'buyer_address' => $dAddress['address_text'] ?? 'Boulevard de la LibertÃ©, Quartier Akwa, Douala, Cameroon',
            'buyer_landmark_directions' => 'Near BICEC Bank Main Gate, White 2-Story Building with Blue Gate',
            'buyer_phone' => $customer->phone ?? '+237 671 234 567',
            'buyer_delivery_instructions' => 'Call buyer on arrival. Buyer will inspect parcel & sign proof of delivery on phone.',
        ]);
    }

    /**
     * Update active trip stage (1: Pickup, 2: Verification, 3: En Route, 4: POD).
     */
    public function updateTripStage(Request $request, string $id): JsonResponse
    {
        $stage = (int) $request->input('stage', 1);

        $order = Order::where('status', 'in_transit')->first() ?? Order::first();
        if ($order) {
            if ($stage === 4) {
                $order->status = 'delivered';
                $order->save();
            }
        }

        return $this->respondSuccess([
            'trip_id' => $id,
            'stage' => $stage,
            'updated' => true,
        ]);
    }

    /**
     * Submit Proof of Delivery (photo or signature).
     */
    public function submitProofOfDelivery(Request $request, string $id): JsonResponse
    {
        $order = Order::where('status', 'in_transit')->first() ?? Order::first();
        if ($order) {
            $order->status = 'delivered';
            $order->save();
        }

        return $this->respondSuccess([
            'delivery_id' => $id,
            'status' => 'delivered',
            'signature_received' => true,
            'captured_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Push background GPS breadcrumb.
     */
    public function pushGPSBreadcrumb(Request $request, string $id): JsonResponse
    {
        $lat = (float) $request->input('latitude', 4.0510);
        $lng = (float) $request->input('longitude', 9.7678);

        $user = $this->resolveUser($request);
        $transporter = $user?->transporter ?? Transporter::where('user_id', $user?->id)->first();
        if ($transporter) {
            $this->logisticsService->updateTransporterGPS($transporter->id, $lat, $lng);
        }

        return $this->respondSuccess(['received' => true]);
    }

    /**
     * Driver profile & vehicle specs.
     */
    public function getProfile(): JsonResponse
    {
        $user = $this->resolveUser(request());
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $transporter = ($user && $user->transporter) ? $user->transporter : Transporter::where('user_id', $user?->id)->first();
        $wallet = $user ? $user->wallet : null;

        $available = (float) ($wallet->balance_available ?? 0);
        $pending = (float) ($wallet->balance_escrow_locked ?? 0);
        $bonus = (float) ($wallet->registration_bonus ?? 0);
        $withdrawable = max(0, $available - $bonus);
        $totalEarned = $wallet ? (float) WalletTransaction::where('wallet_id', $wallet->id)->where('type', 'credit')->sum('amount') : 0;

        return $this->respondSuccess([
            'driver_id' => $transporter->id ?? 'DRV-2026-884',
            'full_name' => $user->full_name ?? 'Paul Eto\'o',
            'phone' => $user->phone ?? '+237 670 123 456',
            'avatar_url' => $user->avatar_url ?? null,
            'rating_avg' => (float) ($transporter->rating_avg ?? 5.0),
            'completed_deliveries' => (int) ($transporter->completed_trips ?? 0),
            'is_verified' => (bool) ($transporter->is_verified ?? false),
            'vehicle' => [
                'type' => $transporter->vehicle_type ?? 'Yamaha YBR 125 ðŸï¸',
                'plate_number' => $transporter->license_plate ?? 'LT-8492-AB',
                'operating_quarter' => 'Akwa / Bonanjo',
                'insurance_status' => 'Active (Dec 2026)',
                'permit_status' => 'Douala Council',
            ],
            'earnings' => [
                'available_cashout' => $available,
                'withdrawable_cashout' => $withdrawable,
                'registration_bonus' => $bonus,
                'pending_escrow' => $pending,
                'total_lifetime_earned' => $totalEarned,
            ],
        ]);
    }

    /**
     * Driver earnings & transaction history.
     */
    public function getEarnings(): JsonResponse
    {
        $user = $this->resolveUser(request());
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $transporter = ($user && $user->transporter) ? $user->transporter : Transporter::where('user_id', $user?->id)->first();
        $wallet = $user ? $user->wallet : null;

        $available = (float) ($wallet->balance_available ?? 0);
        $pending = (float) ($wallet->balance_escrow_locked ?? 0);
        $bonus = (float) ($wallet->registration_bonus ?? 0);
        $withdrawable = max(0, $available - $bonus);

        $txList = [];
        $totalEarned = 0;
        $totalTips = 0;

        if ($wallet) {
            $dbTxs = WalletTransaction::where('wallet_id', $wallet->id)->latest('created_at')->take(20)->get();
            foreach ($dbTxs as $tx) {
                if ($tx->type === 'credit') {
                    $totalEarned += (float) $tx->amount;
                    if (str_contains(strtolower($tx->description ?? ''), 'tip') || str_contains($tx->reference ?? '', 'TIP')) {
                        $totalTips += (float) $tx->amount;
                    }
                }

                $txList[] = [
                    'id' => $tx->id,
                    'code' => $tx->description ?? ($tx->reference ?? 'Trip Payout'),
                    'fee' => (float) $tx->amount,
                    'distance' => str_contains($tx->type, 'payout') || $tx->amount < 0 ? 'Withdrawal' : 'Completed Trip',
                    'date' => $tx->created_at?->format('M d, H:i') ?? 'Recently',
                    'status' => $tx->amount > 0 ? 'credited' : 'cashout',
                ];
            }
        }

        return $this->respondSuccess([
            'available_payout' => $available,
            'withdrawable_payout' => $withdrawable,
            'registration_bonus' => $bonus,
            'pending_escrow' => $pending,
            'total_earned' => $totalEarned,
            'completed_trips_count' => (int) ($transporter->completed_trips ?? count($txList)),
            'rating_avg' => (float) ($transporter->rating_avg ?? 5.0),
            'total_tips_xaf' => $totalTips,
            'transactions' => $txList,
        ]);
    }

    /**
     * Transporter MoMo withdrawal.
     */
    public function withdraw(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $amount = (float) $request->input('amount', 0);
        if ($amount < 100) {
            return $this->respondError('VALIDATION_ERROR', 'Minimum cashout amount is 100 XAF.', ['amount' => ['Minimum is 100 XAF.']], 422);
        }
        $phone = $request->input('phone', $user->phone);
        $provider = $request->input('provider', 'mtn');

        try {
            $result = $this->paymentService->requestPayout($user, $amount, $phone, $provider);
            return $this->respondSuccess($result);
        } catch (\RuntimeException $e) {
            return $this->respondError('WITHDRAWAL_RESTRICTED', $e->getMessage(), ['amount' => [$e->getMessage()]], 422);
        }
    }

    /**
     * Verify scanned barcode or QR code.
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $code = $request->input('code', '');
        $mode = $request->input('mode', 'package');

        $result = $this->logisticsService->verifyScannedCode($code, $mode);

        return $this->respondSuccess($result['data'] ?? [], ['message' => $result['message']]);
    }

    /**
     * Submit Transporter KYC.
     */
    public function submitKYC(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $result = $this->kycService->submitTransporterKYC($user, $request->all());

        return $this->respondSuccess($result);
    }

    /**
     * Get Transporter KYC status.
     */
    public function getKYCStatus(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHENTICATED', 'User session expired or not found', null, 401);
        }

        $transporter = $user->transporter;
        $submission = DB::table('transporter_kyc_submissions')
            ->where('user_id', $user->id)
            ->latest('created_at')
            ->first();

        $status = 'unsubmitted';
        $reviewerNotes = null;
        $reviewedAt = null;
        $submittedAt = null;

        if ($submission) {
            $status = $submission->status;
            $reviewerNotes = $submission->reviewer_notes;
            $reviewedAt = $submission->reviewed_at;
            $submittedAt = $submission->created_at;
        } elseif ($transporter) {
            $status = $transporter->kyc_status ?? 'pending';
        }

        return $this->respondSuccess([
            'submission_id' => $submission->id ?? null,
            'transporter_id' => $transporter->id ?? null,
            'vehicle_type' => $submission->vehicle_type ?? ($transporter->vehicle_type ?? 'motorcycle'),
            'status' => $status,
            'is_verified' => (bool) ($transporter->is_verified ?? false),
            'reviewer_notes' => $reviewerNotes,
            'rejection_reason' => $status === 'rejected' ? $reviewerNotes : null,
            'submitted_at' => $submittedAt,
            'reviewed_at' => $reviewedAt,
        ]);
    }
}
