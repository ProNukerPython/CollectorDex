import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyForm } from "@/features/collection/copy-form";
import { requireUser } from "@/server/session";
import {
  CollectionServiceError,
  getOwnedCopyDetail,
  listEditionsForSelect,
} from "@/services/collection";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ copyId: string }> };

export default async function EditCopyPage({ params }: Props) {
  const user = await requireUser();
  const { copyId } = await params;

  let detail: Awaited<ReturnType<typeof getOwnedCopyDetail>>;
  try {
    detail = await getOwnedCopyDetail(user.id, copyId);
  } catch (error) {
    if (error instanceof CollectionServiceError) {
      notFound();
    }
    throw error;
  }

  const editions = await listEditionsForSelect();
  const allChecklists = await prisma.editionComponent.findMany({
    include: { componentDefinition: true },
    orderBy: [{ sortOrder: "asc" }, { weight: "desc" }],
  });

  const checklistByEdition: Record<
    string,
    Array<{
      componentDefinitionId: string;
      name: string;
      description: string | null;
      weight: number;
      isRequired: boolean;
    }>
  > = {};

  for (const item of allChecklists) {
    const list = checklistByEdition[item.gameEditionId] ?? [];
    list.push({
      componentDefinitionId: item.componentDefinitionId,
      name: item.componentDefinition.name,
      description: item.description ?? item.componentDefinition.description,
      weight: item.weight,
      isRequired: item.isRequired,
    });
    checklistByEdition[item.gameEditionId] = list;
  }

  const { copy, checklist } = detail;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link
          href={`/collection/${copy.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a la copia
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Editar copia
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.gameEdition.game.name}
        </p>
      </div>

      <CopyForm
        mode="edit"
        copyId={copy.id}
        editions={editions.map((edition) => ({
          id: edition.id,
          label: `${edition.game.name} · ${edition.platform.name} · ${edition.region.name}`,
          language: edition.language,
          regionName: edition.region.name,
        }))}
        checklistByEdition={checklistByEdition}
        initial={{
          gameEditionId: copy.gameEditionId,
          condition: copy.condition,
          authenticity: copy.authenticity,
          regionLabel: copy.regionLabel ?? copy.gameEdition.region.name,
          language: copy.language,
          pricePaidCents: copy.pricePaidCents,
          estimatedValueCents: copy.estimatedValueCents,
          currency: copy.currency,
          purchasedAt: copy.purchasedAt
            ? copy.purchasedAt.toISOString().slice(0, 10)
            : "",
          purchasePlatform: copy.purchasePlatform ?? "",
          sellerName: copy.sellerName ?? "",
          listingUrl: copy.listingUrl ?? "",
          serialNumber: copy.serialNumber ?? "",
          notes: copy.notes ?? "",
          isPrimary: copy.isPrimary,
          photoUrls: copy.photoUrls.join("\n"),
          checklist: checklist.map((item) => ({
            componentDefinitionId: item.componentDefinitionId,
            name: item.name,
            description: item.description,
            weight: item.weight,
            isRequired: item.isRequired,
            presence: item.presence,
            condition: item.condition,
            notes: item.notes,
          })),
        }}
      />
    </div>
  );
}
