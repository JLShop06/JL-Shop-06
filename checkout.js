document.addEventListener("DOMContentLoaded", () => {

  const payButton = document.getElementById("pay-button");

  if (!payButton) return;

  payButton.addEventListener("click", async () => {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Panier vide");
      return;
    }

    const lineItems = cart.map(item => ({
      price: item.id,   // 👉 price_id Stripe
      quantity: 1
    }));

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineItems })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur Stripe : " + (data.error || "session invalide"));
      }

    } catch (err) {
      console.error(err);
      alert("Erreur serveur Stripe");
    }
  });

});
