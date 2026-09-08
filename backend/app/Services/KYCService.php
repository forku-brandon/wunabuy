<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Store;
use App\Models\Transporter;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class KYCService
{
    /**
     * Submit Seller Store KYC application documents.
     */
    public function submitSellerKYC(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $store = $user->store ?? Store::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'store_name' => $data['business_name'] ?? ($user->full_name . ' Shop'),
                    'slug' => Str::slug($data['business_name'] ?? ($user->full_name . ' Shop')) . '-' . Str::random(4),
                    'category' => $data['category'] ?? 'General',
                    'address_text' => $data['physical_address'] ?? 'Douala, Cameroon',
                    'is_verified' => false,
                    'kyc_status' => 'pending',
                ]
            );

            $submissionId = (string) Str::uuid();

            DB::table('seller_kyc_submissions')->updateOrInsert(
                ['store_id' => $store->id],
                [
                    'id' => $submissionId,
                    'tax_number' => $data['tax_number'] ?? null,
                    'id_card_url' => $data['id_card_front'] ?? 'https://images.unsplash.com/photo-cni-front',
                    'business_permit_url' => $data['business_register_doc'] ?? null,
                    'status' => 'pending',
                    'reviewer_notes' => null,
                    'submitted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $store->kyc_status = 'pending';
            $store->save();

            return [
                'submission_id' => $submissionId,
                'store_id' => $store->id,
                'status' => 'pending',
                'submitted_at' => now()->toIso8601String(),
            ];
        });
    }

    /**
     * Submit Transporter Driver KYC application documents.
     */
    public function submitTransporterKYC(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $transporter = $user->transporter ?? Transporter::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'vehicle_type' => $data['vehicle_type'] ?? 'bike',
                    'license_plate' => $data['license_plate'] ?? 'LT-123-AB',
                    'is_verified' => false,
                    'kyc_status' => 'pending',
                ]
            );

            $submissionId = (string) Str::uuid();

            DB::table('transporter_kyc_submissions')->updateOrInsert(
                ['transporter_id' => $transporter->id],
                [
                    'id' => $submissionId,
                    'id_card_url' => $data['id_card_front'] ?? 'https://images.unsplash.com/photo-cni-front',
                    'license_url' => $data['drivers_license_photo'] ?? 'https://images.unsplash.com/photo-license',
                    'vehicle_reg_url' => $data['carte_grise_photo'] ?? null,
                    'insurance_url' => $data['vehicle_assurance_photo'] ?? null,
                    'status' => 'pending',
                    'reviewer_notes' => null,
                    'submitted_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $transporter->kyc_status = 'pending';
            $transporter->save();

            return [
                'submission_id' => $submissionId,
                'transporter_id' => $transporter->id,
                'vehicle_type' => $transporter->vehicle_type,
                'status' => 'pending',
                'submitted_at' => now()->toIso8601String(),
            ];
        });
    }

    /**
     * Adjudicate staff KYC decision.
     */
    public function adjudicateKYC(string $id, string $decision, ?string $notes = null, ?string $staffName = null): array
    {
        return DB::transaction(function () use ($id, $decision, $notes, $staffName) {
            $isApproved = strtoupper($decision) === 'APPROVED';
            $status = $isApproved ? 'approved' : 'rejected';

            // Check if seller submission
            $sellerSub = Str::isUuid($id) ? DB::table('seller_kyc_submissions')->where('id', $id)->first() : DB::table('seller_kyc_submissions')->first();
            if ($sellerSub) {
                DB::table('seller_kyc_submissions')->where('id', $sellerSub->id)->update([
                    'status' => $status,
                    'reviewer_notes' => $notes,
                    'verified_at' => $isApproved ? now() : null,
                    'updated_at' => now(),
                ]);

                $store = Store::find($sellerSub->store_id);
                if ($store) {
                    $store->is_verified = $isApproved;
                    $store->kyc_status = $status;
                    $store->save();
                }

                AuditLog::create([
                    'action' => 'KYC_ADJUDICATED',
                    'staff_name' => $staffName ?? 'Compliance Staff',
                    'staff_role' => 'COMPLIANCE_AGENT',
                    'department' => 'KYC',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'target_resource' => 'STORE_KYC:' . $id,
                    'status' => 'SUCCESS',
                    'details' => ['decision' => $decision, 'notes' => $notes],
                ]);

                return ['id' => $id, 'status' => strtoupper($status), 'notes' => $notes];
            }

            // Check transporter submission
            $transporterSub = Str::isUuid($id) ? DB::table('transporter_kyc_submissions')->where('id', $id)->first() : DB::table('transporter_kyc_submissions')->first();
            if ($transporterSub) {
                DB::table('transporter_kyc_submissions')->where('id', $transporterSub->id)->update([
                    'status' => $status,
                    'reviewer_notes' => $notes,
                    'verified_at' => $isApproved ? now() : null,
                    'updated_at' => now(),
                ]);

                $transporter = Transporter::find($transporterSub->transporter_id);
                if ($transporter) {
                    $transporter->is_verified = $isApproved;
                    $transporter->kyc_status = $status;
                    $transporter->save();
                }

                AuditLog::create([
                    'action' => 'KYC_ADJUDICATED',
                    'staff_name' => $staffName ?? 'Compliance Staff',
                    'staff_role' => 'COMPLIANCE_AGENT',
                    'department' => 'KYC',
                    'ip_address' => request()->ip() ?? '127.0.0.1',
                    'target_resource' => 'TRANSPORTER_KYC:' . $id,
                    'status' => 'SUCCESS',
                    'details' => ['decision' => $decision, 'notes' => $notes],
                ]);

                return ['id' => $id, 'status' => strtoupper($status), 'notes' => $notes];
            }

            return ['id' => $id, 'status' => strtoupper($decision), 'notes' => $notes];
        });
    }
}