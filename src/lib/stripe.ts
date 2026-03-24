import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    });
  }

  return stripeClient;
}

export function getStripePriceId(plan: "MONTHLY" | "YEARLY") {
  const priceId =
    plan === "MONTHLY"
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID;

  if (!priceId) {
    throw new Error(
      `Stripe price is not configured for ${plan}. Add ${
        plan === "MONTHLY" ? "STRIPE_MONTHLY_PRICE_ID" : "STRIPE_YEARLY_PRICE_ID"
      } to your environment.`,
    );
  }

  return priceId;
}
