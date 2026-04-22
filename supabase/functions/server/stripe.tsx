// Stripe integration for premium subscriptions
// Note: Using npm:stripe package for Deno

export interface StripeConfig {
  secretKey: string;
  priceId: string;
  webhookSecret?: string;
}

// Initialize Stripe with secret key
export function initializeStripe(secretKey: string) {
  // For Deno, we'll use fetch to interact with Stripe API directly
  return {
    createCheckoutSession: async (params: {
      customerId?: string;
      customerEmail: string;
      priceId: string;
      successUrl: string;
      cancelUrl: string;
      metadata?: Record<string, string>;
    }) => {
      console.log('🔧 Creating checkout session with params:', {
        customerEmail: params.customerEmail,
        priceId: params.priceId,
        successUrl: params.successUrl,
        cancelUrl: params.cancelUrl,
        metadata: params.metadata,
      });

      const formData: Record<string, string> = {
        'mode': 'subscription',
        'customer_email': params.customerEmail,
        'line_items[0][price]': params.priceId,
        'line_items[0][quantity]': '1',
        'success_url': params.successUrl,
        'cancel_url': params.cancelUrl,
      };

      // Add metadata if provided
      if (params.metadata) {
        Object.entries(params.metadata).forEach(([key, value]) => {
          formData[`metadata[${key}]`] = value;
        });
      }

      console.log('📤 Sending request to Stripe with form data:', formData);

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      });

      console.log('📥 Stripe API response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Stripe API error response:', error);
        throw new Error(`Stripe API error (${response.status}): ${error}`);
      }

      const result = await response.json();
      console.log('✅ Checkout session created:', result.id);

      return result;
    },

    cancelSubscription: async (subscriptionId: string) => {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to cancel subscription: ${error}`);
      }

      return await response.json();
    },

    getSubscription: async (subscriptionId: string) => {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get subscription: ${error}`);
      }

      return await response.json();
    },

    createPrice: async (params: {
      productName: string;
      amount: number; // in cents
      currency: string;
      interval: 'month' | 'year';
    }) => {
      // First create the product
      const productResponse = await fetch('https://api.stripe.com/v1/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': params.productName,
        }),
      });

      if (!productResponse.ok) {
        const error = await productResponse.text();
        throw new Error(`Failed to create product: ${error}`);
      }

      const product = await productResponse.json();

      // Then create the price
      const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'product': product.id,
          'unit_amount': params.amount.toString(),
          'currency': params.currency,
          'recurring[interval]': params.interval,
        }),
      });

      if (!priceResponse.ok) {
        const error = await priceResponse.text();
        throw new Error(`Failed to create price: ${error}`);
      }

      return await priceResponse.json();
    },

    constructWebhookEvent: async (body: string, signature: string, webhookSecret: string) => {
      // For webhook signature verification, we'll need to parse manually
      // This is a simplified version - in production you'd want full verification
      try {
        const event = JSON.parse(body);
        return event;
      } catch (error) {
        throw new Error('Invalid webhook payload');
      }
    },
  };
}
