<?php

namespace App\Contracts;

/**
 * GatewayResponse
 *
 * Normalised, immutable response returned by every PaymentGatewayInterface
 * method. Decouples business logic from provider-specific response shapes.
 *
 * @package App\Contracts
 */
final class GatewayResponse
{
    public function __construct(
        /** Whether the gateway call itself succeeded (HTTP 2xx / stub OK). */
        public readonly bool $success,

        /** Normalised status string: 'pending' | 'completed' | 'failed' | 'cancelled' */
        public readonly string $status,

        /** Provider-issued transaction / reference ID. */
        public readonly string $reference,

        /** Human-readable message from the provider or stub. */
        public readonly string $message,

        /** Net amount processed (XAF). */
        public readonly float $amount,

        /** Provider code: 'mtn' | 'orange' | 'escrow' */
        public readonly string $provider,

        /** Raw response payload for debugging / audit. Never exposed in API responses. */
        public readonly array $raw = [],

        /** Error code from provider, if any. */
        public readonly ?string $errorCode = null,
    ) {}

    // ─── Static factories ─────────────────────────────────────────────────────

    /** Build a successful completed response. */
    public static function completed(
        string $reference,
        float  $amount,
        string $provider,
        string $message = 'Transaction completed',
        array  $raw = []
    ): self {
        return new self(
            success:   true,
            status:    'completed',
            reference: $reference,
            message:   $message,
            amount:    $amount,
            provider:  $provider,
            raw:       $raw,
        );
    }

    /** Build a pending (awaiting async confirmation) response. */
    public static function pending(
        string $reference,
        float  $amount,
        string $provider,
        string $message = 'Transaction pending confirmation',
        array  $raw = []
    ): self {
        return new self(
            success:   true,
            status:    'pending',
            reference: $reference,
            message:   $message,
            amount:    $amount,
            provider:  $provider,
            raw:       $raw,
        );
    }

    /** Build a failure response. */
    public static function failed(
        string $reference,
        float  $amount,
        string $provider,
        string $message = 'Transaction failed',
        ?string $errorCode = null,
        array  $raw = []
    ): self {
        return new self(
            success:   false,
            status:    'failed',
            reference: $reference,
            message:   $message,
            amount:    $amount,
            provider:  $provider,
            raw:       $raw,
            errorCode: $errorCode,
        );
    }

    /** Convert to array for API responses / logging. */
    public function toArray(): array
    {
        return [
            'success'   => $this->success,
            'status'    => $this->status,
            'reference' => $this->reference,
            'message'   => $this->message,
            'amount'    => $this->amount,
            'provider'  => $this->provider,
        ];
    }
}
