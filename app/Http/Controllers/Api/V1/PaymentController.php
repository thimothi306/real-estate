<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\PaymentResource;
use App\Http\Resources\SubscriptionResource;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\RazorpayService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use App\Http\Controllers\Controller;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(protected RazorpayService $razorpay)
    {
        $this->middleware('auth:sanctum');
    }

    /** Start a payment to feature a property for 30 days. */
    public function purchaseFeaturedListing(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $amount = 499.00; // flat featured-listing fee

        return $this->createOrder($request, 'featured_listing', $property->id, $amount);
    }

    /** Start a payment to subscribe to a plan. */
    public function subscribe(Request $request, SubscriptionPlan $plan)
    {
        abort_unless($plan->target_role === $request->user()->role, 403, 'This plan is not available for your account type.');
        abort_unless($plan->is_active, 422, 'This plan is no longer available.');

        return $this->createOrder($request, 'subscription', $plan->id, (float) $plan->price);
    }

    protected function createOrder(Request $request, string $purpose, int $referenceId, float $amount)
    {
        $payment = Payment::create([
            'user_id' => $request->user()->id,
            'purpose' => $purpose,
            'reference_id' => $referenceId,
            'amount' => $amount,
            'status' => Payment::STATUS_PENDING,
        ]);

        try {
            $order = $this->razorpay->createOrder($amount, "payment-{$payment->id}");
        } catch (RuntimeException $e) {
            $payment->update(['status' => Payment::STATUS_FAILED, 'failure_reason' => $e->getMessage()]);

            return $this->error($e->getMessage(), 503);
        }

        $payment->update(['gateway_order_id' => $order['order_id']]);

        return $this->success([
            'payment_id' => $payment->id,
            'razorpay_order_id' => $order['order_id'],
            'razorpay_key' => $order['key'],
            'amount' => $order['amount'],
            'currency' => $order['currency'],
        ], 'Order created.', 201);
    }

    /**
     * Called by the client after Razorpay Checkout completes. Verifies the
     * signature server-side (never trust the client's claim of success) and
     * applies the payment's effect.
     */
    public function verify(Request $request)
    {
        $data = $request->validate([
            'payment_id' => ['required', 'integer', 'exists:payments,id'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        $payment = Payment::where('id', $data['payment_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        abort_unless($payment->gateway_order_id === $data['razorpay_order_id'], 422, 'Order mismatch.');

        $valid = $this->razorpay->verifySignature(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature']
        );

        if (! $valid) {
            $payment->update(['status' => Payment::STATUS_FAILED, 'failure_reason' => 'Signature verification failed.']);

            return $this->error('Payment could not be verified.', 422);
        }

        DB::transaction(function () use ($payment, $data) {
            $payment->update([
                'status' => Payment::STATUS_COMPLETED,
                'gateway_payment_id' => $data['razorpay_payment_id'],
                'gateway_signature' => $data['razorpay_signature'],
                'paid_at' => now(),
            ]);

            match ($payment->purpose) {
                'featured_listing' => $this->applyFeaturedListing($payment),
                'subscription' => $this->applySubscription($payment),
                default => null,
            };
        });

        return $this->success(new PaymentResource($payment->fresh()), 'Payment successful.');
    }

    protected function applyFeaturedListing(Payment $payment): void
    {
        Property::where('id', $payment->reference_id)->update([
            'is_featured' => true,
            'featured_until' => now()->addDays(30),
        ]);
    }

    protected function applySubscription(Payment $payment): void
    {
        $plan = SubscriptionPlan::find($payment->reference_id);

        if (! $plan) {
            return;
        }

        // A new purchase replaces any existing active subscription for this user
        // rather than stacking — simplest model for the MVP.
        Subscription::where('user_id', $payment->user_id)->where('status', 'active')->update(['status' => 'expired']);

        Subscription::create([
            'user_id' => $payment->user_id,
            'subscription_plan_id' => $plan->id,
            'payment_id' => $payment->id,
            'status' => 'active',
            'starts_at' => now(),
            'ends_at' => now()->addDays($plan->duration_days),
        ]);
    }

    public function myPayments(Request $request)
    {
        $payments = $request->user()->payments()->latest()->paginate(20);

        return $this->success(
            PaymentResource::collection($payments->items()),
            'OK',
            200,
            ['total' => $payments->total()]
        );
    }

    public function mySubscription(Request $request)
    {
        $subscription = $request->user()->activeSubscription()->with('plan')->first();

        return $this->success($subscription ? new SubscriptionResource($subscription) : null);
    }
}
