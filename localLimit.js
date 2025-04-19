document.addEventListener("DOMContentLoaded", () => {
  console.log("Limit Modal Loaded");

  // Animate load class
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 1000);

  // Stripe checkout handler
  document.getElementById("upgradeBtn").addEventListener("click", handleUpgrade);

  // Login
  document.getElementById("loginBtn").addEventListener("click", () => {
    window.open("https://your-site.com/login", "_blank");
  });

  // Wait
  document.getElementById("waitBtn").addEventListener("click", () => {
    window.close();
  });
});

// Async Stripe handler
async function handleUpgrade() {
  try {
    const res = await fetch("https://b8df0ca0-33e6-4b75-a1f3-5524ede8a8a3-00-311caz7ousjf5.kirk.replit.dev/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: "price_1REWhUH0X3jl7rGgaPktwRWl" })
    });

    const { sessionId } = await res.json();

    const stripe = Stripe("pk_test_51RDmW7HUjZD2YXOR0c5P3PJjahcMtGkDS3ubMSTi0wDxCTFGs1JIMHxHpXyvaEQiS9AJMXvWLKDh2rjI2wLTAcZn00ZXTkQ1dr");

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      alert("Something went wrong.");
    }
  } catch (err) {
    console.error("Upgrade error:", err);
    alert("Failed to start checkout.");
  }
}
