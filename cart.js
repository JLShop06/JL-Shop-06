document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = {
        id: button.dataset.id,   // 🔥 IMPORTANT
        name: button.dataset.name,
        price: button.dataset.price
      };

      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));

      alert(product.name + " ajouté au panier");
    });
  });
});
