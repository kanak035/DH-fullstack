import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

function getDisplayName(user: SupabaseUser) {
  const metadataName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;

  if (metadataName) {
    return metadataName;
  }

  if (!user.email) {
    return null;
  }

  return user.email.split("@")[0] ?? null;
}

function getAvatarUrl(user: SupabaseUser) {
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return avatarUrl;
}

export async function ensureUserProfile(user: SupabaseUser) {
  if (!user.email) {
    return null;
  }

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: getDisplayName(user),
      image: getAvatarUrl(user),
    },
    create: {
      email: user.email,
      name: getDisplayName(user),
      image: getAvatarUrl(user),
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
