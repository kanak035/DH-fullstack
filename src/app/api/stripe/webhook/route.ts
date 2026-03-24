import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

function mapStripeStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "INACTIVE";
  }
}

async function resolveUserIdFromSubscription(subscription: Stripe.Subscription) {
  const metadataUserId =
    typeof subscription.metadata?.userId === "string" ? subscription.metadata.userId : null;

  if (metadataUserId) {
    return metadataUserId;
  }

  if (!subscription.customer) {
    return null;
  }

  const stripe = getStripe();
  const customer =
    typeof subscription.customer === "string"
      ? await stripe.customers.retrieve(subscription.customer)
      : subscription.customer;

  if (customer.deleted || !customer.email) {
    return null;
  }

  const appUser = await prisma.user.findUnique({
    where: { email: customer.email },
  });

  return appUser?.id ?? null;
}

async function syncStripeSubscription(subscription: Stripe.Subscription) {
  const userId = await resolveUserIdFromSubscription(subscription);

  if (!userId) {
    return;
  }

  const existingCharitySelection = await prisma.userCharity.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const planFromMetadata =
    subscription.metadata?.plan === "YEARLY" ? "YEARLY" : "MONTHLY";

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeId: subscription.id,
      plan: planFromMetadata,
      status: mapStripeStatus(subscription.status),
      charityPercentage: existingCharitySelection?.percentage ?? 10,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
    create: {
      userId,
      stripeId: subscription.id,
      plan: planFromMetadata,
      status: mapStripeStatus(subscription.status),
      charityPercentage: existingCharitySelection?.percentage ?? 10,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
    },
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id,
        );

        await syncStripeSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncStripeSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
