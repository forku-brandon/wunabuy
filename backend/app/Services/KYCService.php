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
                    'store_name' => $data['store_name'] ?? ($data['business_name'] ?? ($user->full_name . ' Shop')),
                    'slug' => Str::slug($data['store_name'] ?? ($data['business_name'] ?? ($user->full_name . ' Shop'))) . '-' . Str::random(4),
                    'category' => $data['category'] ?? 'General',
                    'address_text' => $data['address_text'] ?? ($data['physical_address'] ?? 'Douala, Cameroon'),
                    'is_verified' => false,
                ]
            );

            $submissionId = (string) Str::uuid();

            DB::table('seller_kyc_submissions')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'id' => $submissionId,
                    'store_name' => $data['store_name'] ?? ($data['business_name'] ?? $store->store_name),
                    'description' => $data['description'] ?? ($store->description ?? 'Store on Wunabuy'),
                    'category' => $data['category'] ?? ($store->category ?? 'General'),
                    'address_text' => $data['address_text'] ?? ($store->address_text ?? 'Douala, Cameroon'),
                    'city' => $data['city'] ?? 'Douala',
                    'latitude' => $data['latitude'] ?? null,
                    'longitude' => $data['longitude'] ?? null,
                    'cni_number' => $data['cni_number'] ?? 'CNI-PENDING',
                    'id_card_front_url' => $data['id_card_front'] ?? 'https://images.unsplash.com/photo-cni-front',
                    'id_card_back_url' => $data['id_card_back'] ?? 'https://images.unsplash.com/photo-cni-back',
                    'storefront_photo_url' => $data['storefront_photo'] ?? 'https://images.unsplash.com/photo-storefront',
                    'business_reg_url' => $data['business_reg_or_affidavit'] ?? ($data['business_register_doc'] ?? null),
                    'status' => 'pending',
                    'reviewer_notes' => null,
                    'reviewed_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $store->is_verified = false;
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
                    'vehicle_type' => $data['vehicle_type'] ?? 'motorcycle',
                    'vehicle_plate' => $data['license_plate'] ?? ($data['vehicle_plate'] ?? 'LT-123-AB'),
                    'status' => 'pending',
                ]
            );

            $submissionId = (string) Str::uuid();

            DB::table('transporter_kyc_submissions')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'id' => $submissionId,
                    'vehicle_type' => $data['vehicle_type'] ?? $transporter->vehicle_type,
                    'vehicle_plate' => $data['license_plate'] ?? ($data['vehicle_plate'] ?? $transporter->license_plate),
                    'driver_license_url' => $data['drivers_license_photo'] ?? ($data['driver_license_url'] ?? 'https://images.unsplash.com/photo-license'),
                    'national_id_url' => $data['id_card_front'] ?? ($data['national_id_url'] ?? 'https://images.unsplash.com/photo-cni-front'),
                    'vehicle_insurance_url' => $data['vehicle_insurance_doc'] ?? ($data['insurance_url'] ?? null),
                    'status' => 'pending',
                    'reviewer_notes' => null,
                    'reviewed_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $transporter->status = 'pending';
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
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);

                $user = User::find($sellerSub->user_id);
                if ($user) {
                    $store = $user->store ?? Store::firstOrCreate(
                        ['user_id' => $user->id],
                        [
                            'store_name' => $sellerSub->store_name,
                            'slug' => Str::slug($sellerSub->store_name) . '-' . Str::random(4),
                            'category' => $sellerSub->category,
                            'address_text' => $sellerSub->address_text,
                        ]
                    );
                    $store->is_verified = $isApproved;
                    $store->save();

                    $roles = $user->available_roles ?? ['buyer'];
                    if ($isApproved) {
                        if (!in_array('seller', $roles)) {
                            $roles[] = 'seller';
                        }
                    } else {
                        $roles = array_values(array_filter($roles, fn($r) => $r !== 'seller'));
                        if ($user->role === 'seller') {
                            $user->role = 'buyer';
                        }
                    }
                    $user->available_roles = array_values(array_unique($roles));
                    $user->save();
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
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);

                $user = User::find($transporterSub->user_id);
                if ($user) {
                    $transporter = $user->transporter ?? Transporter::firstOrCreate(
                        ['user_id' => $user->id],
                        [
                            'vehicle_type' => $transporterSub->vehicle_type,
                            'vehicle_plate' => $transporterSub->vehicle_plate,
                            'status' => 'online',
                        ]
                    );
                    $transporter->status = $isApproved ? 'active' : 'pending';
                    $transporter->save();

                    $roles = $user->available_roles ?? ['buyer'];
                    if ($isApproved) {
                        if (!in_array('transporter', $roles)) {
                            $roles[] = 'transporter';
                        }
                    } else {
                        $roles = array_values(array_filter($roles, fn($r) => $r !== 'transporter'));
                        if ($user->role === 'transporter') {
                            $user->role = 'buyer';
                        }
                    }
                    $user->available_roles = array_values(array_unique($roles));
                    $user->save();
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