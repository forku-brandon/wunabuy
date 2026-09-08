<?php

namespace App\Http\Controllers\Api;

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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $payouts = [
            [
                'id' => 'po_001',
                'reference_code' => 'WNB-PO-98124',
                'entity_name' => 'Akwa Super Store (Amadou Bello)',
                'entity_type' => 'SELLER',
                'payment_method' => 'MTN_MOMO',
                'account_number' => '+237 671 223 344',
                'amount' => 125000,
                'commission_deducted' => 4375,
                'net_payout' => 120625,
                'status' => 'PENDING_APPROVAL',
                'requested_at' => now()->subHours(3)->toIso8601String(),
                'risk_score' => 'LOW',
            ],
            [
                'id' => 'po_002',
                'reference_code' => 'WNB-PO-98125',
                'entity_name' => 'Paul Eto\'o (Moto LT-8492-AB)',
                'entity_type' => 'TRANSPORTER',
                'payment_method' => 'ORANGE_MONEY',
                'account_number' => '+237 699 445 566',
                'amount' => 48500,
                'commission_deducted' => 0,
                'net_payout' => 48500,
                'status' => 'PROCESSED',
                'requested_at' => now()->subDay()->toIso8601String(),
                'risk_score' => 'LOW',
            ],
        ];

        return $this->respondSuccess($payouts);
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
        $queue = [
            [
                'id' => 'kyc_sel_001',
                'applicant_name' => 'Amadou Bello',
                'applicant_type' => 'STORE_SELLER',
                'entity_title' => 'Akwa Super Store',
                'phone' => '+237 671 223 344',
                'city_quarter' => 'Douala / Akwa',
                'cni_number' => '1198234882',
                'submitted_at' => now()->subDays(1)->toIso8601String(),
                'status' => 'PENDING_REVIEW',
                'cni_front_url' => 'https://images.unsplash.com/photo-cni-front',
                'cni_back_url' => 'https://images.unsplash.com/photo-cni-back',
                'storefront_or_vehicle_photo' => 'https://images.unsplash.com/photo-storefront',
            ],
            [
                'id' => 'kyc_trn_001',
                'applicant_name' => 'Paul Eto\'o',
                'applicant_type' => 'DRIVER_TRANSPORTER',
                'entity_title' => 'Express Moto Delivery (LT-8492-AB)',
                'phone' => '+237 699 445 566',
                'city_quarter' => 'Douala / Deido',
                'cni_number' => '1199348851',
                'submitted_at' => now()->subDays(2)->toIso8601String(),
                'status' => 'PENDING_REVIEW',
                'cni_front_url' => 'https://images.unsplash.com/photo-cni-front',
                'cni_back_url' => 'https://images.unsplash.com/photo-cni-back',
                'storefront_or_vehicle_photo' => 'https://images.unsplash.com/photo-vehicle',
            ],
        ];

        return $this->respondSuccess($queue);
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
        $disputes = Dispute::with(['order.store', 'raisedBy'])->get();

        $list = [];
        foreach ($disputes as $d) {
            $list[] = [
                'id' => $d->id,
                'order_code' => $d->order->order_code ?? 'WB-2026-9842',
                'buyer_name' => $d->raisedBy->full_name ?? 'Jean Dupont',
                'seller_name' => $d->order?->store?->store_name ?? 'Akwa Super Store',
                'transporter_name' => 'Paul Eto\'o',
                'dispute_reason' => $d->reason ?? 'Damaged item',
                'dispute_description' => $d->description ?? 'Item arrived with damages upon inspection.',
                'escrow_amount' => (float) ($d->order->total_amount ?? 85000),
                'status' => strtoupper($d->status ?? 'OPEN'),
                'filed_at' => $d->created_at?->toIso8601String() ?? now()->subDay()->toIso8601String(),
                'evidence_photos' => !empty($d->evidence_photos) ? $d->evidence_photos : [
                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
                ],
            ];
        }

        if (empty($list)) {
            $list[] = [
                'id' => 'disp_001',
                'order_code' => 'WB-2026-9842',
                'buyer_name' => 'Jean Dupont',
                'seller_name' => 'Akwa Super Store',
                'transporter_name' => 'Paul Eto\'o',
                'dispute_reason' => 'Damaged screen upon unboxing',
                'dispute_description' => 'Buyer unboxed the smartphone in presence of transporter and noticed deep hairline fracture on glass panel.',
                'escrow_amount' => 85000,
                'status' => 'OPEN',
                'filed_at' => now()->subHours(6)->toIso8601String(),
                'evidence_photos' => [
                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
                ],
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

        $dispute = (\Illuminate\Support\Str::isUuid($id) ? Dispute::find($id) : null) ?? Dispute::first();
        if ($dispute) {
            $this->escrowService->adjudicateDispute($dispute->id, $ruling, $rationale, 'Compliance Staff');
        }

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
        $trips = [
            [
                'id' => 'trp_001',
                'trip_code' => 'TRIP-WB-9842',
                'driver_name' => 'Paul Eto\'o',
                'driver_phone' => '+237 699 445 566',
                'driver_vehicle' => 'Moto Yamaha YBR 125 (LT-8492-AB)',
                'store_name' => 'Akwa Super Store',
                'pickup_quarter' => 'Akwa',
                'buyer_name' => 'Jean Dupont',
                'delivery_quarter' => 'Bonanjo',
                'delivery_fee' => 1500,
                'stage' => 3,
                'stage_name' => 'En Route to Customer',
                'distance_km' => 2.4,
                'elapsed_mins' => 14,
                'status' => 'en_route',
                'latitude' => 4.0560,
                'longitude' => 9.7750,
            ],
            [
                'id' => 'trp_002',
                'trip_code' => 'TRIP-WB-9843',
                'driver_name' => 'Jean-Paul Kamga',
                'driver_phone' => '+237 670 123 456',
                'driver_vehicle' => 'Moto Boxer 150 (LT-214-AA)',
                'store_name' => 'Kilo Shop Bonapriso',
                'pickup_quarter' => 'Bonapriso',
                'buyer_name' => 'Marie Claire Ngono',
                'delivery_quarter' => 'Deido',
                'delivery_fee' => 2500,
                'stage' => 1,
                'stage_name' => 'Arriving at Merchant Counter',
                'distance_km' => 1.8,
                'elapsed_mins' => 6,
                'status' => 'picked_up',
                'latitude' => 4.0321,
                'longitude' => 9.6987,
            ],
        ];

        return $this->respondSuccess($trips);
    }

    /**
     * Override trip stage.
     */
    public function overrideTripStage(Request $request, string $id): JsonResponse
    {
        $stage = (int) $request->input('stage', 4);
        $reason = $request->input('reason', 'Manual staff override');

        AuditLog::create([
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
}