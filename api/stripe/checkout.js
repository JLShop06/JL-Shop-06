const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    try {
          if (req.method !== "POST") {
                  return res.status(405).json({ error: "Method not allowed" });
          }

      const body =
              typeof req.body === "string"
              ? JSON.parse(req.body)
                : req.body;

      const cart = body?.cart;

      if (!Array.isArray(cart) || cart.length === 0) {
              return res.status(400).json({ error: "Cart empty or invalid" });
      }

      // IMPORTANT : on utilise priceId et pas id
      const validItems = cart.filter(item => item.priceId && typeof item.priceId === "string");

      if (validItems.length === 0) {
              return res.status(400).json({ error: "No valid products in cart" });
      }

      const line_items = validItems.map((item) => ({
              price: item.priceId,
              quantity: 1
      }));

      // L'origin est détecté dynamiquement depuis la requête :
      // s'adapte automatiquement à toute URL Vercel ou domaine custom futur.
      const origin =
              req.headers.origin ||
              (req.headers.host ? `https://${req.headers.host}` : null);

      if (!origin) {
              return res.status(400).json({ error: "Missing origin" });
      }

      const session = await stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              mode: "payment",
              line_items,
              success_url: `${origin}/success.html`,
              cancel_url: `${origin}/cancel.html`,
      });

      return res.status(200).json({ url: session.url });

    } catch (err) {
          console.error("Stripe error:", err);
          return res.status(500).json({ error: err.message });
    }
};
