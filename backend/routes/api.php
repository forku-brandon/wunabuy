<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommerceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\StaffPortalController;
use App\Http\Controllers\Api\TransporterController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| Wunabuy Enterprise API Gateway Routes
|--------------------------------------------------------------------------
| Fully harmonized with @wunabuy/api-client (Mobile) and Staff Portal.
*/

// Health Check Endpoint
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'data' => [
            'service' => 'Wunabuy API Gateway',
            'version' => '1.0.0-enterprise',
            'status' => 'operational',
            'database' => 'connected',
            'timestamp' => now()->toIso8601String(),
        ],
        'meta' => [
            'request_id' => 'req_' . Str::random(10),
            'timestamp' => now()->toIso8601String(),
        ]
    ]);
});

Route::prefix('v1')->group(function () {

    // ─── AUTHENTICATION & USER PROFILE ───
    Route::post('/auth/otp/send', [AuthController::class, 'sendOtp']);
    Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/login', [AuthController::class, 'sendOtp']);
    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('/users/me', [AuthController::class, 'getMe']);
    Route::put('/users/me', [AuthController::class, 'updateMe']);
    Route::get('/users/addresses', [AuthController::class, 'getAddresses']);
    Route::post('/users/addresses', [AuthController::class, 'addAddress']);
    Route::put('/user/preferences', [AuthController::class, 'updatePreferences']);
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);
    Route::post('/user/switch-role', [AuthController::class, 'switchRole']);

    // ─── COMMERCE, CATALOG & DISCOVERY ───
    Route::get('/home/feed', [CommerceController::class, 'homeFeed']);
    Route::get('/discovery/feed', [CommerceController::class, 'discoveryFeed']);
    Route::get('/products', [CommerceController::class, 'getProducts']);
    Route::post('/products', [CommerceController::class, 'createProduct']);
    Route::get('/products/{id}', [CommerceController::class, 'getProduct']);
    Route::put('/products/{id}', [CommerceController::class, 'updateProduct']);
    Route::delete('/products/{id}', [CommerceController::class, 'deleteProduct']);
    Route::get('/stores/{id}', [CommerceController::class, 'getStore']);
    Route::get('/stores/{id}/pickup-location', [CommerceController::class, 'getStorePickupLocation']);
    Route::get('/promotions/cart-banner', [CommerceController::class, 'getCartBanner']);
    Route::post('/reviews', [CommerceController::class, 'createReview']);
    Route::get('/reviews/{type}/{id}', [CommerceController::class, 'getReviews']);

    // ─── ORDERS & ESCROW LIFECYCLE ───
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/confirm', [OrderController::class, 'confirmReceipt']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::post('/orders/{id}/dispute', [OrderController::class, 'dispute']);

    // ─── SELLER OPERATIONS ───
    Route::get('/seller/dashboard', [SellerController::class, 'dashboard']);
    Route::get('/seller/orders', [SellerController::class, 'orders']);
    Route::post('/seller/orders/{id}/accept', [SellerController::class, 'acceptOrder']);
    Route::post('/seller/orders/{id}/decline', [SellerController::class, 'declineOrder']);
    Route::post('/seller/orders/{id}/ready', [SellerController::class, 'markReady']);
    Route::get('/seller/products', [SellerController::class, 'products']);
    Route::patch('/seller/products/{id}/status', [SellerController::class, 'toggleProductStatus']);
    Route::patch('/seller/products/{id}/stock', [SellerController::class, 'updateStock']);
    Route::post('/seller/wallet/payout', [SellerController::class, 'requestPayout']);
    Route::get('/seller/analytics', [SellerController::class, 'analytics']);
    Route::post('/seller/store/profile', [SellerController::class, 'updateProfile']);
    Route::get('/seller/products/barcode/{barcode}', [SellerController::class, 'barcodeLookup']);
    Route::post('/seller/kyc/submit', [SellerController::class, 'submitKYC']);
    Route::get('/seller/kyc/status', [SellerController::class, 'getKYCStatus']);

    // ─── TRANSPORTER & LOGISTICS ───
    Route::get('/transporter/jobs', [TransporterController::class, 'getAvailableJobs']);
    Route::get('/delivery/jobs', [TransporterController::class, 'getAvailableJobs']);
    Route::post('/transporter/jobs/{id}/accept', [TransporterController::class, 'acceptJob']);
    Route::post('/delivery/{id}/accept', [TransporterController::class, 'acceptJob']);
    Route::post('/transporter/jobs/{id}/reject', [TransporterController::class, 'rejectJob']);
    Route::post('/transporter/duty-status', [TransporterController::class, 'updateDutyStatus']);
    Route::get('/transporter/active-trip', [TransporterController::class, 'getActiveTrip']);
    Route::post('/transporter/trips/{id}/stage', [TransporterController::class, 'updateTripStage']);
    Route::post('/transporter/trips/{id}/proof-of-delivery', [TransporterController::class, 'submitProofOfDelivery']);
    Route::post('/delivery/{id}/photo', [TransporterController::class, 'submitProofOfDelivery']);
    Route::put('/delivery/{id}/location', [TransporterController::class, 'pushGPSBreadcrumb']);
    Route::get('/transporter/profile', [TransporterController::class, 'getProfile']);
    Route::get('/transporter/earnings', [TransporterController::class, 'getEarnings']);
    Route::post('/transporter/wallet/withdraw', [TransporterController::class, 'withdraw']);
    Route::post('/transporter/verify-code', [TransporterController::class, 'verifyCode']);
    Route::post('/transporter/kyc/submit', [TransporterController::class, 'submitKYC']);
    Route::get('/transporter/kyc/status', [TransporterController::class, 'getKYCStatus']);

    // ─── WALLET & PAYMENTS GATEWAY ───
    Route::get('/wallet', [WalletController::class, 'getWallet']);
    Route::post('/wallet/fund', [WalletController::class, 'fund']);
    Route::post('/wallet/withdraw', [WalletController::class, 'withdraw']);
    Route::get('/wallet/transactions', [WalletController::class, 'getTransactions']);
    Route::get('/wallet/transactions/{id}/status', [WalletController::class, 'checkTransactionStatus']);
    Route::post('/payments/charge', [WalletController::class, 'chargePayment']);
    Route::get('/payments/verify/{ref}', [WalletController::class, 'verifyPayment']);

    // ─── STAFF PORTAL (7 DEPARTMENTS) ───
    Route::post('/staff/auth/request-otp', [StaffPortalController::class, 'requestOTP']);
    Route::post('/staff/auth/verify-otp', [StaffPortalController::class, 'verifyOTP']);
    Route::post('/staff/auth/login', [StaffPortalController::class, 'loginWithPassword']);
    Route::get('/staff/auth/me', [StaffPortalController::class, 'getProfile']);

    Route::get('/staff/financials/payouts', [StaffPortalController::class, 'getPayoutLedger']);
    Route::post('/staff/financials/payouts/{id}/authorize', [StaffPortalController::class, 'authorizePayout']);

    Route::get('/staff/kyc/queue', [StaffPortalController::class, 'getKYCQueue']);
    Route::post('/staff/kyc/{id}/decision', [StaffPortalController::class, 'submitKYCDecision']);

    Route::get('/staff/disputes', [StaffPortalController::class, 'getDisputes']);
    Route::post('/staff/disputes/{id}/adjudicate', [StaffPortalController::class, 'adjudicateDispute']);

    Route::get('/staff/logistics/trips', [StaffPortalController::class, 'getActiveTrips']);
    Route::post('/staff/logistics/trips/{id}/override', [StaffPortalController::class, 'overrideTripStage']);

    Route::get('/staff/roles', [StaffPortalController::class, 'getRolesMatrix']);
    Route::put('/staff/roles/{code}/permissions', [StaffPortalController::class, 'updateRolePermissions']);
    Route::post('/staff/roles', [StaffPortalController::class, 'createRole']);
    Route::delete('/staff/roles/{code}', [StaffPortalController::class, 'deleteRole']);

    Route::get('/staff/audit-logs', [StaffPortalController::class, 'getAuditLogs']);
    Route::post('/staff/audit-logs', [StaffPortalController::class, 'createAuditLog']);

    Route::get('/staff/members', [StaffPortalController::class, 'getStaffMembers']);
    Route::post('/staff/members', [StaffPortalController::class, 'createStaffMember']);
    Route::put('/staff/members/{id}', [StaffPortalController::class, 'updateStaffMember']);
    Route::delete('/staff/members/{id}', [StaffPortalController::class, 'deleteStaffMember']);

    Route::get('/staff/tasks', [StaffPortalController::class, 'getTasks']);
    Route::post('/staff/tasks', [StaffPortalController::class, 'createTask']);
    Route::patch('/staff/tasks/{id}/status', [StaffPortalController::class, 'updateTaskStatus']);

});