import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/server/session";

type Props = {
  params: Promise<{ editionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Convenience route: /games/[editionId]?action=add-copy
 * Redirects to catalog detail or collection create form.
 */
export default async function GameEditionBridgePage({
  params,
  searchParams,
}: Props) {
  await requireUser();
  const { editionId } = await params;
  const query = await searchParams;
  const action = Array.isArray(query.action) ? query.action[0] : query.action;

  const edition = await prisma.gameEdition.findUnique({
    where: { id: editionId },
    select: { id: true, slug: true },
  });

  if (!edition) {
    redirect("/catalog");
  }

  if (action === "add-copy") {
    redirect(`/collection/new?editionId=${edition.id}`);
  }

  redirect(`/catalog/${edition.slug}`);
}
