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
        $user = $this->resolveUser($request);
        $transporter = $user?->transporter ?? ($user ? Transporter::where('user_id', $user->id)->first() : null);

        $orders = Order::with(['store', 'customer', 'items'])
            ->whereIn('status', ['ready_for_pickup', 'pending', 'preparing'])
            ->whereNull('transporter_id')
            ->latest()
            ->get();

        // If transporter is resolved, filter out orders this transporter has rejected
        if ($transporter) {
            $orders = $orders->filter(function ($order) use ($transporter) {
                $rejected = $order->rejected_transporters ?? [];
                if (!is_array($rejected)) {
                    $rejected = json_decode((string) $rejected, true) ?? [];
                }
                return !in_array($transporter->id, $rejected);
            });
        }

        $jobs = [];
        foreach ($orders as $order) {
            $store = $order->store;
            $sLat = (float) ($store->latitude ?? 4.0510);
            $sLng = (float) ($store->longitude ?? 9.7678);

            $dAddress = $order->delivery_address ?? [];
            $dLat = (float) ($dAddress['latitude'] ?? 4.0611);
            $dLng = (float) ($dAddress['longitude'] ?? 9.7863);
            $dText = is_array($dAddress) ? ($dAddress['address_text'] ?? ($dAddress['label'] ?? 'Douala')) : (string) $dAddress;

            $distance = $this->logisticsService->calculateHaversineDistance($sLat, $sLng, $dLat, $dLng);

            $itemsSummary = $order->items->map(function ($it) {
                return "{$it->quantity}x {$it->name}";
            })->join(', ');
            if (empty($itemsSummary)) {
                $itemsSummary = '1x Wunabuy Verified Package';
            }

            $jobs[] = [
                'id' => 'job_' . $order->id,
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'store' => [
                    'id' => $store->id ?? 's_1',
                    'store_name' => $store->store_name ?? 'Merchant Store',
                    'rating_avg' => (float) ($store->rating_avg ?? 4.9),
                    'is_verified' => (bool) ($store->is_verified ?? true),
                ],
                'pickup_address' => [
                    'id' => 'p_' . $order->id,
                    'label' => 'Store Pickup',
                    'latitude' => $sLat,
                    'longitude' => $sLng,
                    'address_text' => $store->address_text ?? 'Akwa, Douala',
                    'city' => 'Douala',
                    'is_default' => false,
                ],
                'delivery_address' => [
                    'id' => 'd_' . $order->id,
                    'label' => 'Buyer Location',
                    'latitude' => $dLat,
                    'longitude' => $dLng,
                    'address_text' => $dText,
                    'city' => 'Douala',
                    'is_default' => true,
                ],
                'items_summary' => $itemsSummary,
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
    public function acceptJob(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }
        $transporter = $user->transporter ?? Transporter::where('user_id', $user->id)->first();
        if (!$transporter) {
            return $this->respondError('FORBIDDEN', 'Transporter profile required to accept delivery jobs', null, 403);
        }

        // Extract UUID or prefix from job_ prefix if present
        $cleanId = str_starts_with($id, 'job_') ? substr($id, 4) : $id;

        $order = (Str::isUuid($cleanId) ? Order::find($cleanId) : null)
            ?? Order::where('order_code', $cleanId)->first()
            ?? Order::where('order_code', $id)->first();

        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Delivery job not found', null, 404);
        }

        if ($order->transporter_id && $order->transporter_id !== $transporter->id) {
            return $this->respondError('JOB_ALREADY_ASSIGNED', 'This delivery job has already been claimed by another rider', null, 409);
        }

        $order->transporter_id = $transporter->id;
        // Assign transporter to order. Order remains ready_for_pickup until seller verifies 4-digit handover PIN.
        if (in_array($order->status, ['pending', 'pending_acceptance', 'preparing'])) {
            $order->status = 'ready_for_pickup';
        }
        $order->save();

        return $this->respondSuccess([
            'accepted' => true,
            'job_id' => $id,
            'order_id' => $order->id,
            'status' => 'accepted',
        ]);
    }

    /**
     * Reject delivery job and persist rejection in PostgreSQL so it never reappears for this rider.
     */
    public function rejectJob(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        $transporter = $user?->transporter ?? ($user ? Transporter::where('user_id', $user->id)->first() : null);

        $cleanId = str_starts_with($id, 'job_') ? substr($id, 4) : $id;
        $order = (Str::isUuid($cleanId) ? Order::find($cleanId) : null)
            ?? Order::where('order_code', $cleanId)->first()
            ?? Order::where('order_code', $id)->first();

        if ($order && $transporter) {
            $rejected = $order->rejected_transporters ?? [];
            if (!is_array($rejected)) {
                $rejected = json_decode((string) $rejected, true) ?? [];
            }
            if (!in_array($transporter->id, $rejected)) {
                $rejected[] = $transporter->id;
                $order->rejected_transporters = $rejected;
                $order->save();
            }
        }

        return $this->respondSuccess([
            'rejected' => true,
            'job_id' => $id,
            'order_id' => $order?->id,
            'transporter_id' => $transporter?->id,
        ]);
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
        $jobId = $request->query('job_id');
        $cleanId = $jobId ? (str_starts_with($jobId, 'job_') ? substr($jobId, 4) : $jobId) : null;

        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $transporter = $user->transporter ?? Transporter::where('user_id', $user->id)->first();
        if (!$transporter) {
            return $this->respondError('FORBIDDEN', 'Transporter profile required', null, 403);
        }

        $query = Order::with(['store', 'customer', 'items'])
            ->where('transporter_id', $transporter->id);

        $order = null;
        if ($cleanId) {
            $order = (Str::isUuid($cleanId) ? (clone $query)->find($cleanId) : null)
                ?? (clone $query)->where('order_code', $cleanId)->first();
        }

        if (!$order) {
            $order = (clone $query)->whereIn('status', ['in_transit', 'ready_for_pickup'])->latest()->first();
        }

        if (!$order) {
            return $this->respondError('NOT_FOUND', 'No active delivery trip found for this transporter.', null, 404);
        }

        $store = $order->store;
        $customer = $order->customer;
        $dAddress = $order->delivery_address ?? [];
        $dText = is_array($dAddress) ? ($dAddress['address_text'] ?? ($dAddress['label'] ?? 'Douala, Cameroon')) : (string) $dAddress;

        $itemsSummary = $order->items->map(function ($it) {
            return "{$it->quantity}x {$it->name}";
        })->join(', ');
        if (empty($itemsSummary)) {
            $itemsSummary = '1x Wunabuy Verified Package';
        }

        $stage = 1;
        if ($order->status === 'delivered') {
            $stage = 4;
        } elseif ($order->status === 'in_transit') {
            $stage = 3;
        } elseif ($order->status === 'ready_for_pickup') {
            $stage = 1;
        }

        return $this->respondSuccess([
            'job_id' => 'job_' . $order->id,
            'order_code' => $order->order_code ?? 'WB-2026-9842',
            'current_stage' => $stage,
            'verification_code' => $order->pickup_verification_pin ?? '7842',
            'delivery_fee' => (float) ($order->delivery_fee ?? 1500),
            'items_summary' => $itemsSummary,
            'package_specs' => 'Standard Package (< 5 kg)',
            'store_name' => $store->store_name ?? 'Merchant Store',
            'store_address' => $store->address_text ?? 'Douala, Cameroon',
            'store_landmark_directions' => 'Merchant Store Front',
            'store_phone' => $store->phone ?? ($store->user?->phone ?? '+237 670 123 456'),
            'store_operating_hours' => $store->counter_hours ?? 'Mon - Sat: 8:00 AM - 6:30 PM',
            'store_handover_instructions' => 'Handover Code Verification: Present rider ID & ask merchant for the 4-digit pickup PIN upon parcel collection.',
            'buyer_name' => $customer->full_name ?? ($dAddress['full_name'] ?? 'Buyer Customer'),
            'buyer_address' => $dText,
            'buyer_landmark_directions' => 'Customer Delivery Address',
            'buyer_phone' => $customer->phone ?? ($dAddress['phone'] ?? '+237 671 234 567'),
            'buyer_delivery_instructions' => 'Call buyer on arrival. Buyer will inspect parcel & sign proof of delivery on phone.',
        ]);
    }

    /**
     * Update active trip stage (1: Pickup, 2: Verification, 3: En Route, 4: POD).
     */
    public function updateTripStage(Request $request, string $id): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $transporter = $user->transporter ?? Transporter::where('user_id', $user->id)->first();
        if (!$transporter && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Transporter profile required', null, 403);
        }

        $stage = (int) $request->input('stage', 1);
        $cleanId = str_starts_with($id, 'job_') ? substr($id, 4) : $id;

        $order = (Str::isUuid($cleanId) ? Order::find($cleanId) : null)
            ?? Order::where('order_code', $cleanId)->first();

        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Delivery order not found', null, 404);
        }

        if ($transporter && $order->transporter_id !== $transporter->id && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: you are not the assigned transporter for this order', null, 403);
        }

        if ($stage === 3) {
            // STRICT SECURITY HANDSHAKE: Rider cannot advance to En Route unless merchant confirmed handover
            if ($order->status !== 'in_transit') {
                return $this->respondError(
                    'HANDOVER_NOT_VERIFIED',
                    'Merchant has not confirmed the 4-digit handover PIN yet. Please ask the merchant to enter PIN ' . ($order->pickup_pin ?? '7842') . ' in their Wunabuy Seller app to authorize parcel handover.',
                    ['pin' => ['Merchant handover verification required before transit.']],
                    422
                );
            }
        } elseif ($stage === 4) {
            $order->status = 'delivered';
            $order->delivered_at = $order->delivered_at ?? now();
        }
        $order->save();

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
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $transporter = $user->transporter ?? Transporter::where('user_id', $user->id)->first();
        if (!$transporter && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Transporter profile required', null, 403);
        }

        $cleanId = str_starts_with($id, 'job_') ? substr($id, 4) : $id;

        $order = (Str::isUuid($cleanId) ? Order::find($cleanId) : null)
            ?? Order::where('order_code', $cleanId)->first();

        if (!$order) {
            return $this->respondError('NOT_FOUND', 'Delivery order not found', null, 404);
        }

        if ($transporter && $order->transporter_id !== $transporter->id && !in_array($user->role, ['admin', 'superadmin'])) {
            return $this->respondError('FORBIDDEN', 'Unauthorized: you are not the assigned transporter for this order', null, 403);
        }

        $order->status = 'delivered';
        $order->save();

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
            'driver_id' => $transporter?->id ?? ('DRV-' . strtoupper(substr($user->id, 0, 8))),
            'full_name' => $user->full_name ?? '',
            'phone' => $user->phone ?? '',
            'avatar_url' => $user->avatar_url ?? null,
            'rating_avg' => (float) ($transporter->rating_avg ?? 5.0),
            'completed_deliveries' => (int) ($transporter->total_trips ?? 0),
            'is_verified' => (bool) ($transporter && ($transporter->status === 'approved' || $transporter->status === 'active')),
            'vehicle' => [
                'type' => $transporter?->vehicle_type ?? '',
                'plate_number' => $transporter?->vehicle_plate ?? '',
                'license_number' => $transporter?->license_number ?? '',
                'operating_quarter' => '',
                'insurance_status' => '',
                'permit_status' => '',
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
     * Update Driver Profile & Vehicle Specs.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return $this->respondError('UNAUTHORIZED', 'Authentication required', null, 401);
        }

        $transporter = ($user && $user->transporter) ? $user->transporter : Transporter::where('user_id', $user->id)->first();
        if (!$transporter) {
            $transporter = Transporter::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'vehicle_type' => $request->input('vehicle_type', 'motorcycle'),
                'vehicle_plate' => $request->input('vehicle_plate', $request->input('plate_number', '')),
                'license_number' => $request->input('license_number', ''),
                'status' => 'active',
                'is_online' => true,
                'rating_avg' => 5.0,
                'total_trips' => 0,
                'total_earnings' => 0,
            ]);
        }

        if ($request->has('vehicle_type')) $transporter->vehicle_type = $request->input('vehicle_type');
        if ($request->has('vehicle_plate')) $transporter->vehicle_plate = $request->input('vehicle_plate');
        if ($request->has('plate_number')) $transporter->vehicle_plate = $request->input('plate_number');
        if ($request->has('license_number')) $transporter->license_number = $request->input('license_number');
        $transporter->save();

        if ($request->has('full_name')) {
            $user->full_name = $request->input('full_name');
            $user->save();
        }

        return $this->getProfile();
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
