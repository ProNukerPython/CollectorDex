import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setPrimaryOwnedCopyAction } from "@/features/collection/actions";
import { DeleteCopyButton } from "@/features/collection/delete-copy-button";
import { CollectionServiceError, getOwnedCopyDetail } from "@/services/collection";
import { requireUser } from "@/server/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCentsEs, formatDateEs } from "@/lib/format";
import {
  AUTHENTICITY_LABELS,
  COMPLETENESS_DESCRIPTOR_LABELS,
  COMPONENT_PRESENCE_LABELS,
  COPY_CONDITION_LABELS,
  MARKETPLACE_LABELS,
} from "@/lib/labels";

type Props = { params: Promise<{ copyId: string }> };

export default async function CopyDetailPage({ params }: Props) {
  const user = await requireUser();
  const { copyId } = await params;

  let detail: Awaited<ReturnType<typeof getOwnedCopyDetail>>;
  try {
    detail = await getOwnedCopyDetail(user.id, copyId);
  } catch (error) {
    if (error instanceof CollectionServiceError && error.code === "NOT_FOUND") {
      notFound();
    }
    if (error instanceof CollectionServiceError && error.code === "FORBIDDEN") {
      notFound();
    }
    throw error;
  }

  const { copy, checklist, completeness, estimatedValueCents, savingsCents } =
    detail;
  const imageSrc = copy.gameEdition.imageUrl ?? "/placeholders/games/generic.svg";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/collection"
          className="mb-3 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Volver a Mi colección
        </Link>
        <div className="grid gap-5 md:grid-cols-[180px_1fr]">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[180px] overflow-hidden rounded-xl border border-border/80 bg-muted">
            <Image src={imageSrc} alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={copy.isPrimary ? "default" : "secondary"}>
                {copy.isPrimary ? "Principal" : "Duplicado"}
              </Badge>
              <Badge variant="outline">
                {COPY_CONDITION_LABELS[copy.condition]}
              </Badge>
              <Badge variant="outline">
                {AUTHENTICITY_LABELS[copy.authenticity]}
              </Badge>
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
              {copy.gameEdition.game.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {copy.gameEdition.platform.name} · {copy.gameEdition.region.name} ·{" "}
              {copy.language.toUpperCase()}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/collection/${copy.id}/edit`}
                className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm text-primary-foreground hover:bg-primary/80"
              >
                Editar
              </Link>
              {!copy.isPrimary ? (
                <form action={setPrimaryOwnedCopyAction.bind(null, copy.id)}>
                  <Button type="submit" variant="outline">
                    Marcar como principal
                  </Button>
                </form>
              ) : null}
              <Link
                href={`/catalog/${copy.gameEdition.slug}`}
                className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
              >
                Ver ficha
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Precio pagado"
          value={
            copy.pricePaidCents === null
              ? "—"
              : formatCentsEs(copy.pricePaidCents, copy.currency)
          }
        />
        <Metric
          label="Valor estimado"
          value={formatCentsEs(estimatedValueCents, copy.currency)}
        />
        <Metric
          label={
            savingsCents !== null && savingsCents < 0
              ? "Sobreprecio"
              : "Ahorro"
          }
          value={
            savingsCents === null
              ? "—"
              : formatCentsEs(Math.abs(savingsCents), copy.currency)
          }
          tone={
            savingsCents === null
              ? "default"
              : savingsCents < 0
                ? "negative"
                : "positive"
          }
        />
        <Metric
          label="Completitud"
          value={
            completeness.percent === null
              ? COMPLETENESS_DESCRIPTOR_LABELS.NO_CHECKLIST
              : `${completeness.percent}%`
          }
          hint={COMPLETENESS_DESCRIPTOR_LABELS[completeness.descriptor]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Detalles de compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Fecha"
              value={
                copy.purchasedAt ? formatDateEs(copy.purchasedAt) : "—"
              }
            />
            <Row
              label="Plataforma"
              value={
                copy.purchasePlatform
                  ? MARKETPLACE_LABELS[copy.purchasePlatform]
                  : "—"
              }
            />
            <Row label="Vendedor" value={copy.sellerName ?? "—"} />
            <Row
              label="URL"
              value={
                copy.listingUrl ? (
                  <a
                    href={copy.listingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    Abrir anuncio
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row label="N.º serie" value={copy.serialNumber ?? "—"} />
            <Row label="Notas" value={copy.notes ?? "—"} />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Imágenes</CardTitle>
            <CardDescription>URLs registradas en el MVP</CardDescription>
          </CardHeader>
          <CardContent>
            {copy.photoUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin imágenes.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {copy.photoUrls.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-2 hover:underline break-all"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Checklist de componentes</CardTitle>
          <CardDescription>
            Peso conseguido {completeness.earnedWeight} / {completeness.totalWeight}
            {completeness.missingNames.length > 0
              ? ` · Faltan: ${completeness.missingNames.join(", ")}`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checklist.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin checklist.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {checklist.map((item) => (
                <li
                  key={item.componentDefinitionId}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.isRequired ? "Obligatorio" : "Opcional"} · peso{" "}
                      {item.weight}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {COMPONENT_PRESENCE_LABELS[item.presence]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive">
            Eliminar copia
          </CardTitle>
          <CardDescription>
            Se eliminarán {detail.relatedPurchaseCount > 0
              ? `los vínculos con ${detail.relatedPurchaseCount} compra(s) (las compras permanecerán) y `
              : ""}
            todos los componentes asociados a esta copia. Esta acción no se puede
            deshacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteCopyButton
            copyId={copy.id}
            relatedPurchaseCount={detail.relatedPurchaseCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <Card className="border-border/80">
      <CardContent className="space-y-1 pt-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={
            tone === "positive"
              ? "text-xl font-semibold tabular-nums text-[var(--success)]"
              : tone === "negative"
                ? "text-xl font-semibold tabular-nums text-destructive"
                : "text-xl font-semibold tabular-nums"
          }
        >
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
