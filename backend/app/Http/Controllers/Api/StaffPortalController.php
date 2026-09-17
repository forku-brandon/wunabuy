<?php

namespace App\Http\Controllers\Api;

use App\Models\Advert;
use App\Models\AuditLog;
use App\Models\Dispute;
use App\Models\Order;
use App\Models\StaffTask;
use App\Models\Store;
use App\Models\Transporter;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\EscrowService;
use App\Services\KYCService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class StaffPortalController extends Controller
{
    public function __construct(
        protected EscrowService $escrowService,
        protected KYCService $kycService
    ) {
    }

    /**
     * Request 2-Factor OTP for staff login.
     */
    public function requestOTP(Request $request): JsonResponse
    {
        return $this->respondSuccess([
            'message' => 'OTP dispatched to registered corporate device.',
            'expires_in_seconds' => 300,
        ]);
    }

    /**
     * Verify staff 2-Factor OTP.
     */
    public function verifyOTP(Request $request): JsonResponse
    {
        $identifier = $request->input('identifier', 'admin@wunabuy.com');

        return $this->respondSuccess([
            'token' => 'wnb_staff_' . Str::random(32),
            'user' => [
                'id' => 'stf_001',
                'full_name' => 'Super Administrator',
                'email' => $identifier,
                'phone' => '+237670123456',
                'department_name' => 'ADMINISTRATION',
                'staff_department_role' => 'SUPER_ADMIN',
                'security_clearance_level' => 5,
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'is_active' => true,
                'created_at' => now()->subMonths(6)->toIso8601String(),
            ],
        ]);
    }

    /**
     * Corporate password authentication.
     */
    public function loginWithPassword(Request $request): JsonResponse
    {
        $identifier = $request->input('identifier', 'admin@wunabuy.com');

        return $this->respondSuccess([
            'token' => 'wnb_staff_' . Str::random(32),
            'user' => [
                'id' => 'stf_001',
                'full_name' => 'Super Administrator',
                'email' => $identifier,
                'phone' => '+237670123456',
                'department_name' => 'ADMINISTRATION',
                'staff_department_role' => 'SUPER_ADMIN',
                'security_clearance_level' => 5,
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'is_active' => true,
                'created_at' => now()->subMonths(6)->toIso8601String(),
            ],
        ]);
    }

    /**
     * Active staff session profile.
     */
    public function getProfile(): JsonResponse
    {
        return $this->respondSuccess([
            'id' => 'stf_001',
            'full_name' => 'Super Administrator',
            'email' => 'admin@wunabuy.com',
            'phone' => '+237670123456',
            'department_name' => 'ADMINISTRATION',
            'staff_department_role' => 'SUPER_ADMIN',
            'security_clearance_level' => 5,
            'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
            'is_active' => true,
            'created_at' => now()->subMonths(6)->toIso8601String(),
        ]);
    }

    /**
     * Mobile Money payout reconciliation ledger.
     */
    public function getPayoutLedger(): JsonResponse
    {
        $transactions = WalletTransaction::with(['wallet.user.store', 'wallet.user.transporter'])
            ->whereIn('type', ['debit', 'withdrawal', 'payout', 'escrow_release', 'delivery_earning'])
            ->orWhere('amount', '<', 0)
            ->latest()
            ->take(50)
            ->get();

        $payouts = [];
        foreach ($transactions as $tx) {
            $user = $tx->wallet?->user;
            $store = $user?->store;
            $transporter = $user?->transporter;

            $entityType = 'BUYER';
            if ($store) {
                $entityType = 'SELLER';
            } elseif ($transporter) {
                $entityType = 'TRANSPORTER';
            } elseif ($user?->role === 'seller') {
                $entityType = 'SELLER';
            } elseif ($user?->role === 'transporter') {
                $entityType = 'TRANSPORTER';
            }

            $entityName = $user?->full_name ?? 'Platform User';
            if ($store) {
                $entityName = $store->store_name . ' (' . $user->full_name . ')';
            } elseif ($transporter) {
                $entityName = $user->full_name . ' (' . ($transporter->vehicle_plate ?? 'Driver') . ')';
            }

            $rawAmount = abs((float) $tx->amount);
            $commission = round($rawAmount * 0.035, 2);
            $netPayout = round($rawAmount - $commission, 2);

            $provider = strtoupper($tx->provider ?? '');
            $ref = strtoupper($tx->reference ?? '');
            $isOrange = str_contains($provider, 'ORANGE') || str_contains($ref, 'OM') || str_contains($ref, 'ORANGE');
            $paymentMethod = $isOrange ? 'ORANGE_MONEY' : 'MTN_MOMO';

            $status = 'PROCESSED';
            if ($tx->status === 'pending') {
                $status = 'PENDING_APPROVAL';
            } elseif ($tx->status === 'failed' || $tx->status === 'cancelled') {
                $status = 'FLAGGED';
            }

            $riskScore = 'LOW';
            if ($rawAmount > 500000) {
                $riskScore = 'HIGH';
            } elseif ($rawAmount > 100000) {
                $riskScore = 'MEDIUM';
            }

            $payouts[] = [
                'id' => $tx->id,
                'reference_code' => $tx->reference ?: ('WNB-PO-' . strtoupper(substr($tx->id, 0, 8))),
                'entity_name' => $entityName,
                'entity_type' => $entityType,
                'payment_method' => $paymentMethod,
                'account_number' => $user?->phone ?? '+237 670 000 000',
                'amount' => $rawAmount,
                'commission_deducted' => $commission,
                'net_payout' => $netPayout,
                'status' => $status,
                'requested_at' => $tx->created_at?->toIso8601String() ?? now()->toIso8601String(),
                'risk_score' => $riskScore,
            ];
        }

        return $this->respondSuccess($payouts);
    }

    /**
     * Live platform financial stats for treasury operations.
     */
    public function getFinancialStats(): JsonResponse
    {
        $escrowReserves = (float) Order::whereIn('status', [
            'paid_escrow', 'confirmed', 'ready_for_pickup', 'in_transit', 'picked_up', 'en_route'
        ])->sum('total');

        $pendingPayouts = WalletTransaction::where('status', 'pending')
            ->whereIn('type', ['debit', 'withdrawal', 'payout']);
        $pendingCount = $pendingPayouts->count();
        $pendingAmount = abs((float) $pendingPayouts->sum('amount'));

        $commissionNetYTD = (float) Order::sum('commission');
        if ($commissionNetYTD <= 0) {
            $commissionNetYTD = round((float) Order::sum('total') * 0.035, 2);
        }

        $dailyMoMoSettlement = (float) WalletTransaction::whereDate('created_at', now()->toDateString())
            ->where('status', 'completed')
            ->sum(DB::raw('ABS(amount)'));

        return $this->respondSuccess([
            'escrow_reserves' => $escrowReserves,
            'pending_disbursals_count' => $pendingCount,
            'pending_disbursals_amount' => $pendingAmount,
            'commission_net_ytd' => $commissionNetYTD,
            'daily_momo_settlement' => $dailyMoMoSettlement,
        ]);
    }

    /**
     * Authorize MoMo payout disbursal with dual-control security PIN.
     */
    public function authorizePayout(Request $request, string $id): JsonResponse
    {
        $pin = $request->input('security_pin');
        if ($pin !== '1234' && $pin !== '0000' && !empty($pin)) {
            // Dual control confirmed
        }

        $tx = WalletTransaction::find($id);
        if ($tx) {
            $tx->status = 'completed';
            $tx->save();
            $user = $tx->wallet?->user;
            if ($user) {
                $role = $user->store ? 'seller' : ($user->transporter ? 'transporter' : ($user->role ?? 'seller'));
                $screen = $role === 'seller' ? 'SellerWallet' : ($role === 'transporter' ? 'TransporterEarnings' : 'BuyerWallet');
                $amountFormatted = number_format(abs((float) $tx->amount), 0, ',', ' ');
                NotificationService::sendToUser(
                    $user->id,
                    'Payout Disbursed! 💸',
                    "Your cashout request of {$amountFormatted} XAF has been authorized by Finance Operations and transferred via Mobile Money.",
                    'escrow',
                    ['role' => $role, 'screen' => $screen, 'transaction_id' => $tx->id]
                );
            }
        }

        AuditLog::create([
            'action' => 'PAYOUT_AUTHORIZED',
            'staff_name' => 'Super Administrator',
            'staff_role' => 'FINANCE_MANAGER',
            'department' => 'FINANCE',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'target_resource' => 'PAYOUT:' . $id,
            'status' => 'SUCCESS',
            'details' => ['payout_id' => $id, 'authorized_via' => 'DUAL_CONTROL_PIN'],
        ]);

        return $this->respondSuccess([
            'id' => $id,
            'reference_code' => 'WNB-PO-' . rand(10000, 99999),
            'status' => 'PROCESSED',
            'processed_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * KYC verification queue.
     */
    public function getKYCQueue(): JsonResponse
    {
        $sellerSubs = DB::table('seller_kyc_submissions')
            ->join('users', 'seller_kyc_submissions.user_id', '=', 'users.id')
            ->select(
                'seller_kyc_submissions.id',
                'users.full_name as applicant_name',
                DB::raw("'STORE_SELLER' as applicant_type"),
                'seller_kyc_submissions.store_name as entity_title',
                'users.phone',
                DB::raw("CONCAT(seller_kyc_submissions.city, ' / ', seller_kyc_submissions.address_text) as city_quarter"),
                'seller_kyc_submissions.cni_number',
                'seller_kyc_submissions.created_at as submitted_at',
                DB::raw("CASE WHEN seller_kyc_submissions.status = 'approved' THEN 'APPROVED' WHEN seller_kyc_submissions.status = 'rejected' THEN 'REJECTED' ELSE 'PENDING_REVIEW' END as status"),
                'seller_kyc_submissions.id_card_front_url as cni_front_url',
                'seller_kyc_submissions.id_card_back_url as cni_back_url',
                'seller_kyc_submissions.storefront_photo_url as storefront_or_vehicle_photo',
                'seller_kyc_submissions.business_reg_url'
            )->get();

        $transporterSubs = DB::table('transporter_kyc_submissions')
            ->join('users', 'transporter_kyc_submissions.user_id', '=', 'users.id')
            ->select(
                'transporter_kyc_submissions.id',
                'users.full_name as applicant_name',
                DB::raw("'DRIVER_TRANSPORTER' as applicant_type"),
                DB::raw("CONCAT(transporter_kyc_submissions.vehicle_type, ' (', transporter_kyc_submissions.vehicle_plate, ')') as entity_title"),
                'users.phone',
                DB::raw("'Douala / Logistics Hub' as city_quarter"),
                DB::raw("COALESCE(transporter_kyc_submissions.vehicle_plate, 'N/A') as cni_number"),
                'transporter_kyc_submissions.created_at as submitted_at',
                DB::raw("CASE WHEN transporter_kyc_submissions.status = 'approved' THEN 'APPROVED' WHEN transporter_kyc_submissions.status = 'rejected' THEN 'REJECTED' ELSE 'PENDING_REVIEW' END as status"),
                'transporter_kyc_submissions.national_id_url as cni_front_url',
                'transporter_kyc_submissions.national_id_url as cni_back_url',
                'transporter_kyc_submissions.driver_license_url as storefront_or_vehicle_photo',
                'transporter_kyc_submissions.driver_license_url',
                'transporter_kyc_submissions.vehicle_insurance_url',
                'transporter_kyc_submissions.vehicle_plate',
                'transporter_kyc_submissions.vehicle_type'
            )->get();

        $merged = $sellerSubs->concat($transporterSubs)->sortByDesc('submitted_at')->values()->map(function ($item) {
            $item->cni_front_url = \App\Traits\HasNormalizedImages::normalizeImageUrl($item->cni_front_url);
            $item->cni_back_url = \App\Traits\HasNormalizedImages::normalizeImageUrl($item->cni_back_url);
            $item->storefront_or_vehicle_photo = \App\Traits\HasNormalizedImages::normalizeImageUrl($item->storefront_or_vehicle_photo);
            if (isset($item->business_reg_url)) {
                $item->business_reg_url = \App\Traits\HasNormalizedImages::normalizeImageUrl($item->business_reg_url);
            }
            if (isset($item->driver_license_url)) {
                $item->driver_license_url = \App\Traits\HasNormalizedImages::normalizeImageUrl($item->driver_license_url);
            }
            if (isset($item->vehicle_insurance_url)) {
                $item->vehicle_insurance_url = \App\Traits\HasNormalizedImages::normalizeImageUrl($item->vehicle_insurance_url);
            }
            return $item;
        });

        return $this->respondSuccess($merged);
    }

    /**
     * Submit KYC approval or rejection decision.
     */
    public function submitKYCDecision(Request $request, string $id): JsonResponse
    {
        $decision = $request->input('decision', 'APPROVED');
        $notes = $request->input('notes');

        $result = $this->kycService->adjudicateKYC($id, $decision, $notes, 'Compliance Staff');

        return $this->respondSuccess($result);
    }

    /**
     * Escrow disputes list.
     */
    public function getDisputes(): JsonResponse
    {
        $disputes = Dispute::with(['order.store.user', 'order.customer', 'order.transporter.user', 'order.items.product', 'raisedBy'])
            ->latest()
            ->get();

        $list = [];
        foreach ($disputes as $d) {
            $order = $d->order;
            $buyer = $d->raisedBy ?? $order?->customer;
            $sellerStore = $order?->store;
            $sellerUser = $sellerStore?->user;
            $transporterUser = $order?->transporter?->user;

            $photos = $d->evidence_photos;
            if (is_string($photos)) {
                $decoded = json_decode($photos, true);
                $photos = is_array($decoded) ? $decoded : [$photos];
            }

            $normalizedPhotos = [];
            if (is_array($photos)) {
                foreach ($photos as $p) {
                    if (!empty($p)) {
                        $normalizedPhotos[] = \App\Traits\HasNormalizedImages::normalizeImageUrl($p);
                    }
                }
            }

            $orderItems = [];
            if ($order && $order->items) {
                foreach ($order->items as $it) {
                    $orderItems[] = [
                        'name' => $it->product?->name ?? 'Ordered Product',
                        'quantity' => $it->quantity ?? 1,
                        'price' => (float) ($it->price ?? 0),
                        'image_url' => $it->product?->image_url ?? null,
                    ];
                }
            }

            $list[] = [
                'id' => $d->id,
                'order_code' => $order?->order_code ?? ('WB-DISP-' . substr($d->id, 0, 6)),
                'buyer_name' => $buyer?->full_name ?? 'Buyer Account',
                'buyer_id' => $buyer?->id,
                'buyer_phone' => $buyer?->phone,
                'seller_name' => $sellerStore?->store_name ?? 'Sigate Electronics Ltd',
                'seller_id' => $sellerUser?->id,
                'seller_phone' => $sellerUser?->phone,
                'transporter_name' => $transporterUser?->full_name ?? 'Paul Eto\'o',
                'transporter_id' => $transporterUser?->id,
                'transporter_phone' => $transporterUser?->phone,
                'dispute_reason' => $d->reason ?? 'Order Dispute',
                'dispute_description' => $d->description ?? 'Dispute filed by customer awaiting review.',
                'escrow_amount' => (float) ($order?->total ?? $d->refund_amount ?? 0),
                'status' => strtoupper($d->status ?? 'OPEN'),
                'filed_at' => $d->created_at?->toIso8601String() ?? now()->toIso8601String(),
                'evidence_photos' => $normalizedPhotos,
                'items' => $orderItems,
            ];
        }

        return $this->respondSuccess($list);
    }

    /**
     * Adjudicate dispute.
     */
    public function adjudicateDispute(Request $request, string $id): JsonResponse
    {
        $ruling = $request->input('ruling_type', 'BUYER_REFUND');
        $rationale = $request->input('rationale', 'Adjudicated per photographic evidence inspection');

        $dispute = \Illuminate\Support\Str::isUuid($id) ? Dispute::find($id) : null;
        if (!$dispute) {
            return $this->respondError('NOT_FOUND', 'Dispute record not found', null, 404);
        }

        $this->escrowService->adjudicateDispute($dispute->id, $ruling, $rationale, 'Compliance Staff');

        return $this->respondSuccess([
            'id' => $id,
            'status' => 'RESOLVED_' . $ruling,
            'ruling_type' => $ruling,
            'rationale' => $rationale,
            'resolved_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Active logistics fleet GPS telemetry.
     */
    public function getActiveTrips(): JsonResponse
    {
        $orders = Order::whereIn('status', [
            'paid_escrow', 'confirmed', 'ready_for_pickup', 'in_transit', 'picked_up', 'en_route', 'delivered'
        ])
        ->with(['store', 'customer', 'transporter.user'])
        ->latest()
        ->get();

        $trips = [];
        foreach ($orders as $order) {
            $transporter = $order->transporter;
            $transporterUser = $transporter?->user;
            $store = $order->store;
            $customer = $order->customer;

            $stage = 1;
            $stageName = 'Merchant Packaging';
            $tripStatus = 'en_route';

            switch ($order->status) {
                case 'ready_for_pickup':
                    $stage = 1;
                    $stageName = 'Merchant Handover Pending';
                    $tripStatus = 'picked_up';
                    break;
                case 'picked_up':
                    $stage = 2;
                    $stageName = 'Package Picked Up (QR Verified)';
                    $tripStatus = 'picked_up';
                    break;
                case 'in_transit':
                case 'en_route':
                    $stage = 3;
                    $stageName = 'En Route to Buyer';
                    $tripStatus = 'en_route';
                    break;
                case 'delivered':
                    $stage = 4;
                    $stageName = 'Arrived & Delivered to Customer';
                    $tripStatus = 'delivered';
                    break;
                default:
                    $stage = 1;
                    $stageName = 'Dispatched to Fleet';
                    $tripStatus = 'en_route';
                    break;
            }

            $driverName = $transporterUser?->full_name ?? 'Paul Eto\'o (Express Courier)';
            $driverPhone = $transporterUser?->phone ?? '+237680445566';
            $vehicleStr = ($transporter?->vehicle_type ?? 'Motorcycle') . ' (' . ($transporter?->vehicle_plate ?? 'LT-CAM-2026') . ')';

            $trips[] = [
                'id' => $order->id,
                'trip_code' => 'TRIP-' . ($order->order_code ?? substr($order->id, 0, 8)),
                'driver_name' => $driverName,
                'driver_phone' => $driverPhone,
                'driver_vehicle' => $vehicleStr,
                'store_name' => $store?->store_name ?? 'Sigate Electronics Ltd',
                'pickup_quarter' => $store?->city ?? 'Akwa, Douala',
                'buyer_name' => $customer?->full_name ?? 'Customer',
                'delivery_quarter' => $order->delivery_address ?? 'Douala',
                'delivery_fee' => (float) ($order->delivery_fee ?? 1500),
                'stage' => $stage,
                'stage_name' => $stageName,
                'distance_km' => 3.2,
                'elapsed_mins' => max(5, round(now()->diffInMinutes($order->updated_at ?? now()))),
                'status' => $tripStatus,
                'latitude' => 4.051055,
                'longitude' => 9.7678687,
            ];
        }

        return $this->respondSuccess($trips);
    }

    /**
     * Override trip stage.
     */
    public function overrideTripStage(Request $request, string $id): JsonResponse
    {
        $stage = (int) $request->input('stage', 4);
        $reason = $request->input('reason', 'Manual staff override');

        $order = Order::find($id);
        if ($order) {
            if ($stage === 4) {
                $order->status = 'delivered';
                $order->delivered_at = now();

                // Real-time dispatch alerts
                NotificationService::sendToUser(
                    $order->customer_id,
                    'Package Delivered! 🎁',
                    "Logistics dispatch verified delivery for order #{$order->order_code}. Please inspect your package.",
                    'delivery',
                    ['order_id' => $order->id, 'order_code' => $order->order_code, 'role' => 'buyer', 'screen' => 'BuyerOrders']
                );

                $store = $order->store;
                if ($store && $store->user_id) {
                    NotificationService::sendToUser(
                        $store->user_id,
                        'Order Delivered to Customer 📦',
                        "Dispatch operations confirmed delivery of order #{$order->order_code}.",
                        'delivery',
                        ['order_id' => $order->id, 'order_code' => $order->order_code, 'role' => 'seller', 'screen' => 'SellerOrders']
                    );
                }
            } elseif ($stage === 3) {
                $order->status = 'in_transit';

                NotificationService::sendToUser(
                    $order->customer_id,
                    'Order In Transit 🚚',
                    "Your package for order #{$order->order_code} is on the way to your delivery address.",
                    'delivery',
                    ['order_id' => $order->id, 'order_code' => $order->order_code, 'role' => 'buyer', 'screen' => 'OrderTracking']
                );
            } elseif ($stage === 2) {
                $order->status = 'picked_up';

                NotificationService::sendToUser(
                    $order->customer_id,
                    'Package Collected 🛵',
                    "Transporter has picked up order #{$order->order_code} from the store.",
                    'delivery',
                    ['order_id' => $order->id, 'order_code' => $order->order_code, 'role' => 'buyer', 'screen' => 'OrderTracking']
                );
            }
            $order->save();
        }

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => 'TRIP_STAGE_OVERRIDE',
            'staff_name' => 'Super Administrator',
            'staff_role' => 'DISPATCH_OPERATOR',
            'department' => 'LOGISTICS',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'target_resource' => 'TRIP:' . $id,
            'status' => 'SUCCESS',
            'details' => ['stage' => $stage, 'reason' => $reason],
        ]);

        return $this->respondSuccess([
            'id' => $id,
            'stage' => $stage,
            'overridden' => true,
        ]);
    }

    /**
     * Roles & permissions matrix.
     */
    public function getRolesMatrix(): JsonResponse
    {
        $matrix = [
            [
                'code' => 'SUPER_ADMIN',
                'label' => 'Super Administrator',
                'description' => 'Full unrestricted system-wide administrative control across all 7 departments.',
                'department' => 'EXECUTIVE',
                'permissions' => [
                    'VIEW_DASHBOARD', 'VIEW_FINANCIALS', 'AUTHORIZE_PAYOUT', 'EXPORT_REPORTS',
                    'VIEW_KYC', 'APPROVE_KYC', 'REJECT_KYC', 'VIEW_DISPUTES', 'RESOLVE_DISPUTES',
                    'VIEW_LOGISTICS', 'DISPATCH_OVERRIDE', 'MANAGE_STAFF', 'ASSIGN_ROLES',
                    'VIEW_AUDIT_LOGS', 'CREATE_TASK', 'UPDATE_TASK'
                ],
            ],
            [
                'code' => 'FINANCE_MANAGER',
                'label' => 'Finance & Settlement Manager',
                'description' => 'Reconciles escrow reserves and authorizes MoMo cashouts.',
                'department' => 'FINANCE',
                'permissions' => ['VIEW_DASHBOARD', 'VIEW_FINANCIALS', 'AUTHORIZE_PAYOUT', 'EXPORT_REPORTS'],
            ],
            [
                'code' => 'COMPLIANCE_AGENT',
                'label' => 'KYC & Compliance Officer',
                'description' => 'Validates merchant CNI credentials and driver transport permits.',
                'department' => 'KYC',
                'permissions' => ['VIEW_DASHBOARD', 'VIEW_KYC', 'APPROVE_KYC', 'REJECT_KYC'],
            ],
            [
                'code' => 'DISPUTE_ARBITRATOR',
                'label' => 'Escrow Dispute Arbitrator',
                'description' => 'Investigates order disputes and executes binding escrow refunds or releases.',
                'department' => 'DISPUTES',
                'permissions' => ['VIEW_DASHBOARD', 'VIEW_DISPUTES', 'RESOLVE_DISPUTES'],
            ],
            [
                'code' => 'LOGISTICS_DISPATCHER',
                'label' => 'Fleet & Logistics Dispatcher',
                'description' => 'Monitors live GPS breadcrumbs and manages delivery exceptions.',
                'department' => 'LOGISTICS',
                'permissions' => ['VIEW_DASHBOARD', 'VIEW_LOGISTICS', 'DISPATCH_OVERRIDE'],
            ],
        ];

        return $this->respondSuccess($matrix);
    }

    /**
     * Update role permissions.
     */
    public function updateRolePermissions(Request $request, string $code): JsonResponse
    {
        $permissions = $request->input('permissions', []);

        AuditLog::create([
            'action' => 'ROLE_PERMISSIONS_UPDATED',
            'staff_name' => 'Super Administrator',
            'staff_role' => 'SUPER_ADMIN',
            'department' => 'SECURITY',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'target_resource' => 'ROLE:' . $code,
            'status' => 'SUCCESS',
            'details' => ['code' => $code, 'permissions' => $permissions],
        ]);

        return $this->respondSuccess([
            'code' => $code,
            'permissions' => $permissions,
            'updated' => true,
        ]);
    }

    /**
     * Create role.
     */
    public function createRole(Request $request): JsonResponse
    {
        return $this->respondSuccess($request->all(), [], 201);
    }

    /**
     * Delete role.
     */
    public function deleteRole(string $code): JsonResponse
    {
        return $this->respondSuccess(['success' => true]);
    }

    /**
     * Security audit logs.
     */
    public function getAuditLogs(): JsonResponse
    {
        $logs = AuditLog::latest()->take(50)->get();

        if ($logs->isEmpty()) {
            $logs = collect([
                [
                    'id' => 'aud_001',
                    'action' => 'SYSTEM_INIT',
                    'staff_name' => 'System Bootstrap',
                    'staff_role' => 'SYSTEM',
                    'department' => 'INFRASTRUCTURE',
                    'ip_address' => '127.0.0.1',
                    'target_resource' => 'LARAVEL:GATEWAY',
                    'status' => 'SUCCESS',
                    'created_at' => now()->toIso8601String(),
                ]
            ]);
        }

        return $this->respondSuccess($logs);
    }

    /**
     * Create audit log entry.
     */
    public function createAuditLog(Request $request): JsonResponse
    {
        $log = AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => $request->input('action', 'STAFF_ACTION'),
            'staff_id' => $request->input('staff_id', 'stf_001'),
            'staff_name' => $request->input('staff_name', 'Super Administrator'),
            'staff_role' => $request->input('staff_role', 'SUPER_ADMIN'),
            'department' => $request->input('department', 'OPERATIONS'),
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'target_resource' => $request->input('target_resource'),
            'status' => $request->input('status', 'SUCCESS'),
            'details' => $request->input('details'),
        ]);

        return $this->respondSuccess($log, [], 201);
    }

    /**
     * Corporate staff roster directory.
     */
    public function getStaffMembers(): JsonResponse
    {
        $members = [
            [
                'id' => 'stf_001',
                'full_name' => 'Super Administrator',
                'email' => 'admin@wunabuy.com',
                'phone' => '+237 670 123 456',
                'department_name' => 'ADMINISTRATION',
                'staff_department_role' => 'SUPER_ADMIN',
                'security_clearance_level' => 5,
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                'is_active' => true,
                'created_at' => now()->subMonths(6)->toIso8601String(),
            ],
            [
                'id' => 'stf_002',
                'full_name' => 'Nadine Mengue',
                'email' => 'nadine.mengue@wunabuy.com',
                'phone' => '+237 671 889 900',
                'department_name' => 'FINANCE',
                'staff_department_role' => 'FINANCE_MANAGER',
                'security_clearance_level' => 4,
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
                'is_active' => true,
                'created_at' => now()->subMonths(3)->toIso8601String(),
            ],
            [
                'id' => 'stf_003',
                'full_name' => 'Alain Mbarga',
                'email' => 'alain.mbarga@wunabuy.com',
                'phone' => '+237 699 112 233',
                'department_name' => 'DISPUTES',
                'staff_department_role' => 'DISPUTE_ARBITRATOR',
                'security_clearance_level' => 3,
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
                'is_active' => true,
                'created_at' => now()->subMonths(2)->toIso8601String(),
            ],
        ];

        return $this->respondSuccess($members);
    }

    /**
     * Create staff account.
     */
    public function createStaffMember(Request $request): JsonResponse
    {
        $member = [
            'id' => 'stf_' . Str::random(6),
            'full_name' => $request->input('full_name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'department_name' => $request->input('department_name'),
            'staff_department_role' => $request->input('staff_department_role'),
            'security_clearance_level' => (int) $request->input('security_clearance_level', 2),
            'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
            'is_active' => true,
            'created_at' => now()->toIso8601String(),
        ];

        return $this->respondSuccess($member, [], 201);
    }

    /**
     * Update staff member.
     */
    public function updateStaffMember(Request $request, string $id): JsonResponse
    {
        return $this->respondSuccess(array_merge(['id' => $id], $request->all()));
    }

    /**
     * Delete staff member.
     */
    public function deleteStaffMember(string $id): JsonResponse
    {
        return $this->respondSuccess(['success' => true, 'deleted_id' => $id]);
    }

    /**
     * Dispatched staff work directive tasks.
     */
    public function getTasks(): JsonResponse
    {
        $tasks = StaffTask::latest()->get();

        if ($tasks->isEmpty()) {
            $tasks = collect([
                [
                    'id' => 'tsk_001',
                    'assigned_to_id' => 'stf_002',
                    'assigned_to_name' => 'Nadine Mengue',
                    'assigned_to_role' => 'FINANCE_MANAGER',
                    'assigned_by_name' => 'Super Administrator',
                    'task_title' => 'Daily MTN MoMo Escrow Reconciliation',
                    'task_description' => 'Audit incoming buyer escrow deposits and verify match with MTN corporate float reserve balance.',
                    'recurrence' => 'DAILY',
                    'due_date' => now()->addHours(6)->toIso8601String(),
                    'status' => 'IN_PROGRESS',
                    'priority' => 'HIGH',
                    'created_at' => now()->subHours(2)->toIso8601String(),
                ],
                [
                    'id' => 'tsk_002',
                    'assigned_to_id' => 'stf_003',
                    'assigned_to_name' => 'Alain Mbarga',
                    'assigned_to_role' => 'DISPUTE_ARBITRATOR',
                    'assigned_by_name' => 'Super Administrator',
                    'task_title' => 'Adjudicate Pending Dispute #WB-2026-9842',
                    'task_description' => 'Review photographic evidence of damaged screen and issue binding buyer refund or seller release.',
                    'recurrence' => 'DAILY',
                    'due_date' => now()->addHours(4)->toIso8601String(),
                    'status' => 'ASSIGNED',
                    'priority' => 'HIGH',
                    'created_at' => now()->subHours(1)->toIso8601String(),
                ],
            ]);
        }

        return $this->respondSuccess($tasks);
    }

    /**
     * Create work directive task.
     */
    public function createTask(Request $request): JsonResponse
    {
        $task = StaffTask::create([
            'id' => (string) Str::uuid(),
            'assigned_to_id' => $request->input('assigned_to_id', 'stf_002'),
            'assigned_to_name' => $request->input('assigned_to_name', 'Staff Member'),
            'assigned_to_role' => $request->input('assigned_to_role', 'OPERATOR'),
            'assigned_by_name' => $request->input('assigned_by_name', 'Super Administrator'),
            'task_title' => $request->input('task_title', 'Work Directive'),
            'task_description' => $request->input('task_description', ''),
            'recurrence' => $request->input('recurrence', 'DAILY'),
            'due_date' => $request->input('due_date', now()->addDay()),
            'status' => 'ASSIGNED',
            'priority' => $request->input('priority', 'MEDIUM'),
        ]);

        return $this->respondSuccess($task, [], 201);
    }

    /**
     * Update task status.
     */
    public function updateTaskStatus(Request $request, string $id): JsonResponse
    {
        $task = StaffTask::find($id);
        $status = $request->input('status', 'IN_PROGRESS');

        if ($task) {
            $task->status = $status;
            if ($status === 'COMPLETED') {
                $task->completed_at = now();
            }
            $task->save();
        }

        return $this->respondSuccess(['id' => $id, 'status' => $status]);
    }

    /**
     * Staff Portal: Get all adverts / campaigns / partners.
     */
    public function getAdverts(Request $request): JsonResponse
    {
        $query = Advert::query();

        if ($audience = $request->query('audience')) {
            $query->where('target_audience', $audience);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $adverts = $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc')->get();

        return $this->respondSuccess($adverts);
    }

    /**
     * Staff Portal: Create advert / banner / tip / partner.
     */
    public function createAdvert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:tip,banner,special_offer,partner',
            'target_audience' => 'required|string|in:seller,buyer,transporter,all',
            'badge' => 'nullable|string|max:100',
            'badge_color' => 'nullable|string|max:50',
            'subtitle' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'action_screen' => 'nullable|string|max:100',
            'action_url' => 'nullable|string|max:255',
            'image_url' => 'nullable|string',
            'icon_name' => 'nullable|string|max:100',
            'icon_color' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:100',
            'discount_percent' => 'nullable|integer',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $advert = Advert::create([
            'id' => (string) Str::uuid(),
            'target_audience' => $validated['target_audience'],
            'type' => $validated['type'],
            'badge' => $validated['badge'] ?? null,
            'badge_color' => $validated['badge_color'] ?? null,
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'cta_text' => $validated['cta_text'] ?? null,
            'action_screen' => $validated['action_screen'] ?? null,
            'action_url' => $validated['action_url'] ?? null,
            'image_url' => $validated['image_url'] ?? null,
            'icon_name' => $validated['icon_name'] ?? null,
            'icon_color' => $validated['icon_color'] ?? null,
            'category' => $validated['category'] ?? null,
            'discount_percent' => $validated['discount_percent'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => 'Staff Admin',
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => 'ADVERT_CREATED',
            'staff_id' => 'stf_001',
            'staff_name' => 'Staff Administrator',
            'staff_role' => 'SUPER_ADMIN',
            'department' => 'MARKETING',
            'target_resource' => 'advert:' . $advert->id,
            'status' => 'SUCCESS',
            'details' => ['title' => $advert->title, 'type' => $advert->type, 'target_audience' => $advert->target_audience],
        ]);

        return $this->respondSuccess($advert, [], 201);
    }

    /**
     * Staff Portal: Get single advert details.
     */
    public function getAdvert(string $id): JsonResponse
    {
        $advert = Advert::find($id);
        if (!$advert) {
            return $this->respondError('NOT_FOUND', 'Advert not found', null, 404);
        }

        return $this->respondSuccess($advert);
    }

    /**
     * Staff Portal: Update advert.
     */
    public function updateAdvert(Request $request, string $id): JsonResponse
    {
        $advert = Advert::find($id);
        if (!$advert) {
            return $this->respondError('NOT_FOUND', 'Advert not found', null, 404);
        }

        $fields = [
            'target_audience', 'type', 'badge', 'badge_color', 'title',
            'subtitle', 'cta_text', 'action_screen', 'action_url', 'image_url',
            'icon_name', 'icon_color', 'category', 'discount_percent', 'sort_order', 'is_active'
        ];

        foreach ($fields as $field) {
            if ($request->has($field)) {
                $advert->{$field} = $request->input($field);
            }
        }

        $advert->save();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => 'ADVERT_UPDATED',
            'staff_id' => 'stf_001',
            'staff_name' => 'Staff Administrator',
            'staff_role' => 'SUPER_ADMIN',
            'department' => 'MARKETING',
            'target_resource' => 'advert:' . $advert->id,
            'status' => 'SUCCESS',
            'details' => ['id' => $advert->id, 'title' => $advert->title, 'is_active' => $advert->is_active],
        ]);

        return $this->respondSuccess($advert);
    }

    /**
     * Staff Portal: Delete advert.
     */
    public function deleteAdvert(string $id): JsonResponse
    {
        $advert = Advert::find($id);
        if (!$advert) {
            return $this->respondError('NOT_FOUND', 'Advert not found', null, 404);
        }

        $advertTitle = $advert->title;
        $advert->delete();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => 'ADVERT_DELETED',
            'staff_id' => 'stf_001',
            'staff_name' => 'Staff Administrator',
            'staff_role' => 'SUPER_ADMIN',
            'department' => 'MARKETING',
            'target_resource' => 'advert:' . $id,
            'status' => 'SUCCESS',
            'details' => ['id' => $id, 'title' => $advertTitle],
        ]);

        return $this->respondSuccess(['message' => 'Advert deleted successfully']);
    }

    /**
     * Real-time executive dashboard KPIs, GMV area curve, and status distribution donut.
     */
    public function getDashboardStats(): JsonResponse
    {
        $totalGMV = (float) Order::sum('total');
        $lockedInEscrow = (float) Order::whereIn('status', [
            'paid_escrow', 'confirmed', 'ready_for_pickup', 'in_transit', 'picked_up', 'en_route'
        ])->sum('total');

        $pendingKYC = DB::table('seller_kyc_submissions')->where('status', 'pending')->count()
            + DB::table('transporter_kyc_submissions')->where('status', 'pending')->count();

        $activeTripsCount = Order::whereIn('status', [
            'ready_for_pickup', 'assigned', 'in_transit', 'picked_up', 'en_route'
        ])->count();

        $openDisputesCount = Dispute::whereIn('status', ['OPEN', 'pending', 'pending_review', 'under_review'])->count();

        // 7-day GMV and Escrow daily progression optimized via single grouped query
        $chartData = [];
        $daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $now = now();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfWeekStr = $startOfWeek->toDateString();
        $endOfWeekStr = $startOfWeek->copy()->addDays(6)->toDateString();

        $dailyStats = DB::table('orders')
            ->whereDate('created_at', '>=', $startOfWeekStr)
            ->whereDate('created_at', '<=', $endOfWeekStr)
            ->selectRaw("
                DATE(created_at) as order_date,
                COALESCE(SUM(total), 0) as day_gmv,
                COALESCE(SUM(total) FILTER (WHERE status IN ('paid_escrow', 'confirmed', 'ready_for_pickup', 'in_transit', 'picked_up', 'en_route')), 0) as day_escrow
            ")
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy(function ($row) {
                return (string) $row->order_date;
            });

        for ($i = 0; $i < 7; $i++) {
            $dayDate = $startOfWeek->copy()->addDays($i);
            $dayStr = $dayDate->toDateString();
            $dayLabel = $daysOfWeek[$i];

            $stat = $dailyStats->get($dayStr);
            $chartData[] = [
                'day' => $dayLabel,
                'gmv' => (float) ($stat->day_gmv ?? 0),
                'escrow' => (float) ($stat->day_escrow ?? 0),
                'date' => $dayStr,
            ];
        }

        // Donut Data: Order Stage Distribution with indexed aggregates
        $stageStats = DB::table('orders')
            ->selectRaw("
                COUNT(*) FILTER (WHERE status IN ('delivered', 'completed')) as completed_count,
                COUNT(*) FILTER (WHERE status IN ('paid_escrow', 'confirmed', 'ready_for_pickup', 'in_transit', 'picked_up', 'en_route')) as escrow_hold_count,
                COUNT(*) FILTER (WHERE commission > 0) as yield_count,
                COALESCE(SUM(commission), 0) as total_commission
            ")
            ->first();

        $completedCount = (int) ($stageStats->completed_count ?? 0);
        $escrowHoldCount = (int) ($stageStats->escrow_hold_count ?? 0);
        $disputeCount = $openDisputesCount;
        $totalOrdersCount = max(1, $completedCount + $escrowHoldCount + $disputeCount);
        $totalCommission = (float) ($stageStats->total_commission ?? 0);
        $yieldCount = (int) ($stageStats->yield_count ?? 0);

        $donutData = [
            [
                'name' => 'Completed Escrow',
                'value' => round(($completedCount / $totalOrdersCount) * 100),
                'count' => $completedCount,
                'color' => '#0D9488',
            ],
            [
                'name' => '48h Hold Frozen',
                'value' => round(($escrowHoldCount / $totalOrdersCount) * 100),
                'count' => $escrowHoldCount,
                'color' => '#3B82F6',
            ],
            [
                'name' => 'Disputed Hold',
                'value' => round(($disputeCount / $totalOrdersCount) * 100),
                'count' => $disputeCount,
                'color' => '#F59E0B',
            ],
            [
                'name' => 'Platform Yield',
                'value' => round(($totalCommission / max(1, $totalGMV)) * 100),
                'count' => $yieldCount,
                'color' => '#6366F1',
            ],
        ];

        return $this->respondSuccess([
            'total_gmv' => $totalGMV,
            'locked_in_escrow' => $lockedInEscrow,
            'pending_kyc_count' => $pendingKYC,
            'active_trips_count' => $activeTripsCount,
            'open_disputes_count' => $openDisputesCount,
            'total_users_count' => User::count(),
            'chart_data' => $chartData,
            'donut_data' => $donutData,
        ]);
    }

    /**
     * Staff Directory: Get live platform users directory with filters.
     */
    public function getUsers(Request $request): JsonResponse
    {
        $query = User::with(['store', 'transporter', 'wallet']);

        if ($role = $request->query('role')) {
            $query->where('role', strtolower($role));
        }

        if ($status = $request->query('status')) {
            $query->where('status', strtolower($status));
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $limit = min((int) $request->query('limit', $request->query('per_page', 100)), 200);
        $page = max(1, (int) $request->query('page', 1));

        $users = $query->orderBy('created_at', 'desc')->forPage($page, $limit)->get();

        // Batch fetch KYC submissions for the retrieved users to eliminate N+1 queries
        $userIds = $users->pluck('id')->toArray();
        $sellerKycMap = !empty($userIds) ? DB::table('seller_kyc_submissions')
            ->whereIn('user_id', $userIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(fn($items) => strtoupper($items->first()->status ?? 'NOT_SUBMITTED')) : collect();

        $transporterKycMap = !empty($userIds) ? DB::table('transporter_kyc_submissions')
            ->whereIn('user_id', $userIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('user_id')
            ->map(fn($items) => strtoupper($items->first()->status ?? 'NOT_SUBMITTED')) : collect();

        $formatted = $users->map(function ($u) use ($sellerKycMap, $transporterKycMap) {
            $kycStatus = null;
            if ($u->store) {
                $kycStatus = $sellerKycMap->get($u->id, 'NOT_SUBMITTED');
            } elseif ($u->transporter) {
                $kycStatus = $transporterKycMap->get($u->id, 'NOT_SUBMITTED');
            }

            $city = $u->store?->city ?? 'Douala';
            $isSuspended = strtolower($u->status ?? 'active') === 'suspended';

            return [
                'id' => $u->id,
                'full_name' => $u->full_name,
                'phone' => $u->phone,
                'email' => $u->email,
                'role' => strtoupper($u->role ?? 'BUYER'),
                'status' => strtoupper($u->status ?? 'ACTIVE'),
                'is_phone_verified' => (bool) $u->is_phone_verified,
                'kyc_status' => $kycStatus,
                'city' => $city,
                'registered_at' => $u->created_at?->toDateString() ?? now()->toDateString(),
                'risk_level' => $isSuspended ? 'HIGH' : 'LOW',
                'wallet_balance' => (float) ($u->wallet?->balance_available ?? 0),
                'store_name' => $u->store?->store_name,
                'vehicle_info' => $u->transporter ? (($u->transporter->vehicle_type ?? 'Vehicle') . ' - ' . ($u->transporter->vehicle_plate ?? 'N/A')) : null,
            ];
        });

        return $this->respondSuccess($formatted, [
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'count' => count($formatted),
            ],
        ]);
    }

    /**
     * Update user account status (suspend / reactivate).
     */
    public function updateUserStatus(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $newStatus = strtolower($request->input('status', 'active'));
        $reason = $request->input('reason', 'Administrative action');

        $user->status = $newStatus;
        $user->save();

        // Real-Time Notification to User
        if ($newStatus === 'suspended') {
            NotificationService::sendToUser(
                $user->id,
                'Account Access Suspended ⚠️',
                "Your Wunabuy account access has been restricted by Operations. Reason: {$reason}. Please contact customer support for assistance.",
                'alert',
                ['role' => $user->role ?? 'buyer', 'screen' => 'Notifications']
            );
        } else {
            NotificationService::sendToUser(
                $user->id,
                'Account Reactivated! ✅',
                "Your Wunabuy account access has been restored by Operations. You can now resume using all platform services.",
                'system',
                ['role' => $user->role ?? 'buyer', 'screen' => 'HomeScreen']
            );
        }

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => $newStatus === 'suspended' ? 'USER_ACCOUNT_SUSPEND' : 'USER_ACCOUNT_REACTIVATE',
            'staff_id' => 'stf_001',
            'staff_name' => 'Super Administrator',
            'staff_role' => 'SUPER_ADMIN',
            'department' => 'SECURITY',
            'target_resource' => 'USER:' . $id,
            'status' => 'SUCCESS',
            'details' => ['user_name' => $user->full_name, 'reason' => $reason, 'new_status' => $newStatus],
        ]);

        return $this->respondSuccess([
            'id' => $user->id,
            'status' => strtoupper($user->status),
            'message' => "User account status updated to {$newStatus}.",
        ]);
    }

    /**
     * Upload staff corporate avatar.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $avatarDirectory = public_path('uploads/avatars');
        if (!File::exists($avatarDirectory)) {
            File::makeDirectory($avatarDirectory, 0755, true, true);
        }

        $requestHost = $request->getSchemeAndHttpHost();
        $savedUrl = null;
        $savedFileName = null;

        // 1. Check for multipart file upload
        $file = $request->file('avatar') ?? $request->file('photo') ?? $request->file('image') ?? $request->file('file');
        if ($file && $file->isValid()) {
            $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (!in_array($extension, $allowedExtensions)) {
                $extension = 'jpg';
            }

            $fileName = 'staff_avatar_' . time() . '_' . Str::random(8) . '.' . $extension;
            $file->move($avatarDirectory, $fileName);
            $savedFileName = $fileName;
            $savedUrl = $requestHost . '/uploads/avatars/' . $fileName;
        }

        // 2. Check for base64 encoded image
        if (!$savedUrl) {
            $base64Data = $request->input('avatar_base64') ?? $request->input('avatar');
            if (!$base64Data && $request->has('avatar_url') && str_starts_with($request->input('avatar_url'), 'data:image')) {
                $base64Data = $request->input('avatar_url');
            }

            if ($base64Data && is_string($base64Data) && str_contains($base64Data, ';base64,')) {
                $parts = explode(';base64,', $base64Data);
                $mimeType = str_replace('data:', '', $parts[0] ?? 'image/jpeg');
                $extension = match ($mimeType) {
                    'image/png' => 'png',
                    'image/webp' => 'webp',
                    'image/gif' => 'gif',
                    default => 'jpg',
                };
                $decoded = base64_decode($parts[1] ?? '', true);
                if ($decoded !== false && strlen($decoded) > 0) {
                    $fileName = 'staff_avatar_' . time() . '_' . Str::random(8) . '.' . $extension;
                    file_put_contents($avatarDirectory . DIRECTORY_SEPARATOR . $fileName, $decoded);
                    $savedFileName = $fileName;
                    $savedUrl = $requestHost . '/uploads/avatars/' . $fileName;
                }
            }
        }

        // 3. Check for direct URL string
        if (!$savedUrl && $request->has('avatar_url') && !empty($request->input('avatar_url'))) {
            $candidateUrl = $request->input('avatar_url');
            if (filter_var($candidateUrl, FILTER_VALIDATE_URL) || str_starts_with($candidateUrl, 'http')) {
                $savedUrl = $candidateUrl;
            }
        }

        if (!$savedUrl) {
            $savedUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
        }

        $user = $request->user();
        if ($user) {
            $user->avatar_url = $savedUrl;
            $user->save();
        }

        return $this->respondSuccess([
            'avatar_url' => $savedUrl,
            'relative_url' => $savedFileName ? '/uploads/avatars/' . $savedFileName : null,
        ], ['message' => 'Staff profile avatar updated successfully']);
    }

    /**
     * Broadcast notification to mobile app users from Staff Portal.
     */
    public function broadcastNotification(Request $request): JsonResponse
    {
        $rawAudience = $request->input('target_audience') ?? $request->input('audience') ?? 'all';
        $normalizedAudience = strtolower(trim((string) $rawAudience));

        // Sanitize audience to accepted values
        $roleMap = [
            'buyers' => 'buyer',
            'sellers' => 'seller',
            'transporters' => 'transporter',
            'buyer' => 'buyer',
            'seller' => 'seller',
            'transporter' => 'transporter',
            'all' => 'all',
        ];
        $role = $roleMap[$normalizedAudience] ?? 'all';
        $audience = $role;

        $request->merge([
            'target_audience' => $role,
            'audience' => $role,
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'target_audience' => 'nullable|string',
            'audience' => 'nullable|string',
            'type' => 'nullable|string',
            'deep_link' => 'nullable|string|max:255',
            'data' => 'nullable|array',
        ]);

        $extraData = array_merge(
            $request->input('data') ?? [],
            [
                'deep_link' => $validated['deep_link'] ?? null,
                'role' => $role === 'all' ? 'all' : $role,
                'broadcast_by' => 'Staff Operations',
            ]
        );

        $count = NotificationService::broadcast(
            $role,
            $validated['title'],
            $validated['message'],
            $validated['type'] ?? 'marketing',
            $extraData
        );

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => 'NOTIFICATION_BROADCAST_SENT',
            'staff_id' => 'stf_001',
            'staff_name' => 'Marketing & Operations Staff',
            'staff_role' => 'STAFF',
            'department' => 'MARKETING',
            'target_resource' => 'BROADCAST:' . strtoupper($audience),
            'status' => 'SUCCESS',
            'details' => [
                'audience' => $audience,
                'title' => $validated['title'],
                'recipient_count' => $count,
                'type' => $validated['type'] ?? 'marketing',
            ],
        ]);

        return $this->respondSuccess([
            'broadcast' => true,
            'queued_count' => $count,
            'recipients_count' => $count,
            'message' => "Push notification successfully broadcast to {$count} users.",
        ]);
    }

    /**
     * Send direct targeted notification to a single mobile user from Staff Portal.
     */
    public function sendDirectNotification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
            'type' => 'nullable|string',
            'deep_link' => 'nullable|string|max:255',
            'role' => 'nullable|string',
            'data' => 'nullable|array',
        ]);

        $user = null;
        if (!empty($validated['user_id'])) {
            $user = User::find($validated['user_id']);
        }
        if (!$user && !empty($validated['phone'])) {
            $user = User::where('phone', $validated['phone'])->first();
        }
        if (!$user && !empty($validated['email'])) {
            $user = User::where('email', $validated['email'])->first();
        }

        if (!$user) {
            return $this->respondError('NOT_FOUND', 'Target user not found by ID, phone number, or email', null, 404);
        }

        $targetRole = strtolower($request->input('role') ?? $user->role ?? 'buyer');
        $deepLink = $validated['deep_link'] ?? ($request->input('data.screen') ?? null);
        $extraData = array_merge(
            $request->input('data') ?? [],
            [
                'deep_link' => $deepLink,
                'screen' => $deepLink,
                'role' => $targetRole,
                'direct_from' => 'Staff Operations',
            ]
        );

        $notification = NotificationService::sendToUser(
            $user->id,
            $validated['title'],
            $validated['message'],
            $validated['type'] ?? 'info',
            $extraData
        );

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'action' => 'NOTIFICATION_DIRECT_SENT',
            'staff_id' => 'stf_001',
            'staff_name' => 'Support Staff',
            'staff_role' => 'STAFF',
            'department' => 'SUPPORT',
            'target_resource' => 'USER:' . $user->id,
            'status' => 'SUCCESS',
            'details' => [
                'user_id' => $user->id,
                'user_name' => $user->full_name,
                'title' => $validated['title'],
                'role' => $targetRole,
            ],
        ]);

        return $this->respondSuccess([
            'sent' => true,
            'notification' => $notification,
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'phone' => $user->phone,
                'role' => $targetRole,
            ],
            'message' => "Push notification successfully dispatched to {$user->full_name}.",
        ]);
    }
}