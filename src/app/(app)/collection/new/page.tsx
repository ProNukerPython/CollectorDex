import Link from "next/link";
import { CopyForm } from "@/features/collection/copy-form";
import { requireUser } from "@/server/session";
import {
  getEditionChecklist,
  listEditionsForSelect,
} from "@/services/collection";
import { prisma } from "@/lib/db";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewCopyPage({ searchParams }: Props) {
  await requireUser();
  const params = await searchParams;
  const editionIdParam = Array.isArray(params.editionId)
    ? params.editionId[0]
    : params.editionId;
  const wishlistEntryId = Array.isArray(params.wishlistEntryId)
    ? params.wishlistEntryId[0]
    : params.wishlistEntryId;

  const editions = await listEditionsForSelect();
  const selectedId = editionIdParam && editions.some((e) => e.id === editionIdParam)
    ? editionIdParam
    : (editions[0]?.id ?? "");

  const selected = editions.find((edition) => edition.id === selectedId);
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
      presence: "UNKNOWN";
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
      presence: "UNKNOWN",
    });
    checklistByEdition[item.gameEditionId] = list;
  }

  const initialChecklist =
    selectedId !== ""
      ? await getEditionChecklist(selectedId).then((items) =>
          items.map((item) => ({
            componentDefinitionId: item.componentDefinitionId,
            name: item.componentDefinition.name,
            description: item.description ?? item.componentDefinition.description,
            weight: item.weight,
            isRequired: item.isRequired,
            presence: "UNKNOWN" as const,
          })),
        )
      : [];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <Link href="/collection" className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver a Mi colección
        </Link>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Añadir copia
        </h1>
        <p className="text-sm text-muted-foreground">
          Registra una copia física concreta y su checklist de componentes.
        </p>
      </div>

      {editions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay ediciones en el catálogo. Ejecuta el seed primero.
        </p>
      ) : (
        <CopyForm
          mode="create"
          wishlistEntryId={wishlistEntryId}
          editions={editions.map((edition) => ({
            id: edition.id,
            label: `${edition.game.name} · ${edition.platform.name} · ${edition.region.name}`,
            language: edition.language,
            regionName: edition.region.name,
          }))}
          checklistByEdition={checklistByEdition}
          initial={{
            gameEditionId: selectedId,
            condition: "GOOD",
            authenticity: "UNCHECKED",
            regionLabel: selected?.region.name ?? "",
            language: selected?.language ?? "es",
            pricePaidCents: null,
            estimatedValueCents: null,
            currency: "EUR",
            purchasedAt: "",
            purchasePlatform: "",
            sellerName: "",
            listingUrl: "",
            serialNumber: "",
            notes: "",
            isPrimary: true,
            photoUrls: "",
            checklist: initialChecklist,
          }}
        />
      )}
    </div>
  );
}
