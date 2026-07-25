"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createWishlistEntry,
  deleteWishlistEntry,
  updateWishlistEntry,
  WishlistServiceError,
} from "@/services/wishlist";
import { wishlistFormSchema } from "@/schemas/wishlist";
import { requireUser } from "@/server/session";

export type WishlistActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData) {
  return {
    gameEditionId: formData.get("gameEditionId"),
    priority: formData.get("priority"),
    targetPriceEuros: formData.get("targetPriceEuros"),
    maxPriceEuros: formData.get("maxPriceEuros"),
    currency: "EUR",
    minCondition: formData.get("minCondition"),
    desiredRegion: formData.get("desiredRegion") || null,
    notes: formData.get("notes") || null,
    requiredComponentIds: formData.getAll("requiredComponentIds").map(String),
    allowOwnedPrimary: formData.get("allowOwnedPrimary"),
  };
}

function revalidateWishlistPaths(editionSlug?: string) {
  revalidatePath("/wishlist");
  revalidatePath("/catalog");
  revalidatePath("/dashboard");
  if (editionSlug) {
    revalidatePath(`/catalog/${editionSlug}`);
  }
}

export async function createWishlistEntryAction(
  _prev: WishlistActionState,
  formData: FormData,
): Promise<WishlistActionState> {
  const user = await requireUser();
  const parsed = wishlistFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const created = await createWishlistEntry(user.id, parsed.data);
    revalidateWishlistPaths(created.gameEdition.slug);
    redirect("/wishlist");
  } catch (error) {
    if (error instanceof WishlistServiceError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function updateWishlistEntryAction(
  entryId: string,
  _prev: WishlistActionState,
  formData: FormData,
): Promise<WishlistActionState> {
  const user = await requireUser();
  const parsed = wishlistFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const updated = await updateWishlistEntry(user.id, entryId, parsed.data);
    revalidateWishlistPaths(updated.gameEdition.slug);
    redirect("/wishlist");
  } catch (error) {
    if (error instanceof WishlistServiceError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function deleteWishlistEntryAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const deleted = await deleteWishlistEntry(user.id, entryId);
  revalidateWishlistPaths(deleted.editionSlug);
  redirect("/wishlist");
}
