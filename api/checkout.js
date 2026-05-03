const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// base produits sécurisée
const PRODUCTS = {
  "casquette-noire": {
    name: "Casquette unisexe noire",
    price: 10
  }
};

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // sécurité parsing Vercel
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const cart = body?.cart;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart empty or invalid" });
    }

    // validation produits (IMPORTANT pour éviter crash)
    const line_items = [];

    for (const item of cart) {
      const product = PRODUCTS[item.id];

      if (!product) {
        return res.status(400).json({
          error: `Produit inconnu: ${item.id}`
        });
      }

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,

      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/cancel.html`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message });
  }
};
