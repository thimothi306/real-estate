<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin wrapper over Razorpay's Orders API (https://razorpay.com/docs/api/orders/).
 * No SDK dependency — two HTTP calls and an HMAC check cover the whole flow.
 *
 * Needs RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env (test-mode keys are fine
 * for development). Until those are set, order creation throws a clear error
 * rather than silently no-opping — the rest of this class's logic (signature
 * verification) is exercised by tests without needing live credentials.
 */
class RazorpayService
{
    protected ?string $keyId;
    protected ?string $keySecret;

    public function __construct()
    {
        $this->keyId = config('services.razorpay.key');
        $this->keySecret = config('services.razorpay.secret');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->keyId) && ! empty($this->keySecret);
    }

    /**
     * Creates a Razorpay order and returns its id + the key_id the client
     * needs to open Checkout. Amount is in rupees; Razorpay wants paise.
     */
    public function createOrder(float $amountRupees, string $receipt): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException(
                'Payments are not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.'
            );
        }

        $response = Http::withBasicAuth($this->keyId, $this->keySecret)
            ->asJson()
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => (int) round($amountRupees * 100),
                'currency' => 'INR',
                'receipt' => $receipt,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Could not create payment order: '.$response->body());
        }

        return [
            'order_id' => $response->json('id'),
            'key' => $this->keyId,
            'amount' => $response->json('amount'),
            'currency' => $response->json('currency'),
        ];
    }

    /**
     * Verifies the signature Razorpay Checkout returns after a successful
     * payment: HMAC-SHA256 of "order_id|payment_id" using the key secret.
     */
    public function verifySignature(string $orderId, string $paymentId, string $signature): bool
    {
        if (! $this->keySecret) {
            return false;
        }

        $expected = hash_hmac('sha256', "{$orderId}|{$paymentId}", $this->keySecret);

        return hash_equals($expected, $signature);
    }
}
