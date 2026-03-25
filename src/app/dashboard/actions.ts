'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { enforceRollingScores } from "@/lib/scores";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { ensureUserProfile } from "@/lib/users";
import { getAppUrl } from "@/lib/site-url";

export async function recordScore(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const rawValue = formData.get("score");
  const rawDate = formData.get("date");

  const value = Number(rawValue);
  const dateValue = typeof rawDate === "string" ? new Date(rawDate) : null;

  if (!Number.isInteger(value) || value < 1 || value > 45) {
    throw new Error("Score must be a whole number between 1 and 45.");
  }

  if (!dateValue || Number.isNaN(dateValue.getTime())) {
    throw new Error("A valid play date is required.");
  }

  await prisma.score.create({
    data: {
      userId: appUser.id,
      value,
      date: dateValue,
    },
  });

  await enforceRollingScores(appUser.id);

  revalidatePath("/dashboard");
}

export async function saveCharityPreference(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const charityId = formData.get("charityId");
  const rawPercentage = formData.get("percentage");
  const percentage = Number(rawPercentage);

  if (typeof charityId !== "string" || !charityId) {
    throw new Error("A charity selection is required.");
  }

  if (!Number.isInteger(percentage) || percentage < 10 || percentage > 100) {
    throw new Error("Contribution must be a whole number between 10 and 100.");
  }

  const charity = await prisma.charity.findUnique({
    where: { id: charityId },
  });

  if (!charity) {
    throw new Error("Selected charity was not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.userCharity.deleteMany({
      where: { userId: appUser.id },
    });

    await tx.userCharity.create({
      data: {
        userId: appUser.id,
        charityId,
        percentage,
      },
    });

    if (await tx.subscription.findUnique({ where: { userId: appUser.id } })) {
      await tx.subscription.update({
        where: { userId: appUser.id },
        data: {
          charityPercentage: percentage,
        },
      });
    }
  });

  revalidatePath("/dashboard");
}

export async function createCheckoutSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const plan = formData.get("plan");

  if (plan !== "MONTHLY" && plan !== "YEARLY") {
    throw new Error("A valid Stripe checkout plan is required.");
  }

  const stripe = getStripe();
  const priceId = getStripePriceId(plan);
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: appUser.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: appUser.id,
      plan,
    },
    subscription_data: {
      metadata: {
        userId: appUser.id,
        plan,
      },
    },
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
  });

  if (!session.url) {
    throw new Error("Stripe checkout session did not return a redirect URL.");
  }

  redirect(session.url);
}

export async function createBillingPortalSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const appUser = await ensureUserProfile(user);

  if (!appUser) {
    throw new Error("Unable to sync authenticated user.");
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();

  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId: appUser.id },
    select: {
      stripeId: true,
    },
  });

  if (!existingSubscription?.stripeId) {
    throw new Error("No Stripe subscription is linked to this account yet.");
  }

  const subscription = await stripe.subscriptions.retrieve(existingSubscription.stripeId);
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard`,
  });

  redirect(session.url);
}
