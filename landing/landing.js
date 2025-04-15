const stripe = Stripe("pk_test_51RDmW7HUjZD2YXOR0c5P3PJjahcMtGkDS3ubMSTi0wDxCTFGs1JIMHxHpXyvaEQiS9AJMXvWLKDh2rjI2wLTAcZn00ZXTkQ1dr");

async function checkout(priceId) {
  const res = await fetch("https://your-backend.com/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const { sessionId } = await res.json();

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    alert("Payment failed. Try again.");
  }
}
