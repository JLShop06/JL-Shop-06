// worker.js
import Stripe from 'stripe';

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });

    try {
      const { items } = await request.json();
      
      const lineItems = items.map(item => ({
        price: item.priceId,
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: `${request.headers.get('Origin')}/success.html`,
        cancel_url: `${request.headers.get('Origin')}/cancel.html`,
        allow_promotion_codes: true,
      });

      return new Response(JSON.stringify({ id: session.id, url: session.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
