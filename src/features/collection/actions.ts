"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CollectionServiceError,
  createOwnedCopy,
  deleteOwnedCopy,
  setOwnedCopyPrimary,
  updateOwnedCopy,
} from "@/services/collection";
import { ownedCopyFormSchema } from "@/schemas/owned-copy";
import { requireUser } from "@/server/session";
import type { ComponentPresence, CopyCondition } from "@prisma/client";

export type OwnedCopyActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseComponentsFromFormData(formData: FormData) {
  const ids = formData.getAll("componentDefinitionId").map(String);
  return ids.map((componentDefinitionId, index) => ({
    componentDefinitionId,
    presence: String(
      formData.get(`presence_${componentDefinitionId}`) ?? "UNKNOWN",
    ) as ComponentPresence,
    condition: (() => {
      const value = formData.get(`componentCondition_${componentDefinitionId}`);
      if (!value) return null;
      return String(value) as CopyCondition;
    })(),
    notes: (() => {
      const value = formData.get(`componentNotes_${componentDefinitionId}`);
      if (!value) return null;
      return String(value);
    })(),
    index,
  }));
}

function formDataToObject(formData: FormData) {
  return {
    gameEditionId: formData.get("gameEditionId"),
    condition: formData.get("condition"),
    authenticity: formData.get("authenticity"),
    regionLabel: formData.get("regionLabel") || null,
    language: formData.get("language") || "es",
    pricePaidEuros: formData.get("pricePaidEuros"),
    estimatedValueEuros: formData.get("estimatedValueEuros"),
    currency: formData.get("currency") || "EUR",
    purchasedAt: formData.get("purchasedAt") || null,
    purchasePlatform: formData.get("purchasePlatform") || null,
    sellerName: formData.get("sellerName") || null,
    listingUrl: formData.get("listingUrl") || null,
    serialNumber: formData.get("serialNumber") || null,
    notes: formData.get("notes") || null,
    isPrimary: formData.get("isPrimary"),
    photoUrls: formData.get("photoUrls") || "",
    components: parseComponentsFromFormData(formData),
  };
}

function revalidateCollectionPaths(editionSlug?: string) {
  revalidatePath("/collection");
  revalidatePath("/dashboard");
  revalidatePath("/catalog");
  revalidatePath("/stats");
  if (editionSlug) {
    revalidatePath(`/catalog/${editionSlug}`);
  }
}

export async function createOwnedCopyAction(
  _prev: OwnedCopyActionState,
  formData: FormData,
): Promise<OwnedCopyActionState> {
  const user = await requireUser();
  const parsed = ownedCopyFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const created = await createOwnedCopy(user.id, parsed.data);
    revalidateCollectionPaths();
    redirect(`/collection/${created.id}`);
  } catch (error) {
    if (error instanceof CollectionServiceError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function updateOwnedCopyAction(
  copyId: string,
  _prev: OwnedCopyActionState,
  formData: FormData,
): Promise<OwnedCopyActionState> {
  const user = await requireUser();
  const parsed = ownedCopyFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos no válidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await updateOwnedCopy(user.id, copyId, parsed.data);
    revalidateCollectionPaths();
    redirect(`/collection/${copyId}`);
  } catch (error) {
    if (error instanceof CollectionServiceError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function deleteOwnedCopyAction(copyId: string): Promise<void> {
  const user = await requireUser();
  await deleteOwnedCopy(user.id, copyId);
  revalidateCollectionPaths();
  redirect("/collection");
}

export async function setPrimaryOwnedCopyAction(copyId: string): Promise<void> {
  const user = await requireUser();
  await setOwnedCopyPrimary(user.id, copyId);
  revalidateCollectionPaths();
  redirect(`/collection/${copyId}`);
}
