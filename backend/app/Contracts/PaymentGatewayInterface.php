<?php

namespace App\Contracts;

/**
 * PaymentGatewayInterface
 *
 * All payment providers (MTN MoMo, Orange Money, Internal Escrow)
 * must implement this contract. This ensures clean separation between
 * business logic and payment infrastructure, allowing API keys to be
 * plugged in without touching any business logic code.
 *
 * HOW TO ACTIVATE A REAL GATEWAY:
 * 1. Set the provider's `stub_mode` to false in config/payment.php
 * 2. Fill in real API credentials in .env
 * 3. Implement the SDK calls inside the gateway class (e.g. MtnMomoGateway)
 *    The interface contract guarantees the rest of the app keeps working.
 *
 * @package App\Contracts
 */
interface PaymentGatewayInterface
{
    /**
     * Initiate a payment push (debit customer's mobile money account).
     * Used for wallet top-up and order checkout via MoMo/Orange.
     *
     * @param  string $phone    E.164 phone number to debit (e.g. +237670123456)
     * @param  float  $amount   Amount in XAF (minimum 100)
     * @param  string $reference  Unique idempotency reference for this transaction
     * @param  string $description Human-readable description of the charge
     * @return GatewayResponse
     */
    public function initiatePush(string $phone, float $amount, string $reference, string $description): GatewayResponse;

    /**
     * Initiate a payout disbursement (credit recipient's mobile money account).
     * Used for seller/transporter withdrawals.
     *
     * @param  string $phone    E.164 phone number to credit (e.g. +237670123456)
     * @param  float  $amount   Amount in XAF
     * @param  string $reference  Unique reference for this payout
     * @param  string $description Human-readable reason for payout
     * @return GatewayResponse
     */
    public function initiatePull(string $phone, float $amount, string $reference, string $description): GatewayResponse;

    /**
     * Query the status of a previously initiated transaction by reference.
     *
     * @param  string $reference  The transaction reference to query
     * @return GatewayResponse
     */
    public function queryStatus(string $reference): GatewayResponse;

    /**
     * Validate and parse an incoming webhook notification from the provider.
     * Must verify HMAC/signature and return a normalised GatewayResponse.
     *
     * @param  array  $payload  Raw webhook body from provider
     * @param  string $signature  HMAC or signature header from the webhook
     * @return GatewayResponse
     */
    public function handleWebhook(array $payload, string $signature): GatewayResponse;

    /**
     * Returns true if this gateway is currently in stub (sandbox) mode
     * and is not making real API calls.
     *
     * @return bool
     */
    public function isStubMode(): bool;

    /**
     * Returns the gateway provider code (e.g. 'mtn', 'orange', 'escrow').
     *
     * @return string
     */
    public function getProviderCode(): string;
}
