import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { EditionDetailData } from "@/services/catalog";
import { StatusBadge } from "@/features/catalog/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCentsEs, formatDateEs } from "@/lib/format";
import {
  COMPLETENESS_SEGMENT_LABELS,
  COMPONENT_IMPORTANCE_LABELS,
  COPY_CONDITION_LABELS,
  LISTING_STATUS_LABELS,
  MARKETPLACE_LABELS,
} from "@/lib/labels";
import type { CopyCondition } from "@prisma/client";

export function EditionDetailView({ data }: { data: EditionDetailData }) {
  const imageSrc = data.imageUrl ?? "/placeholders/games/generic.svg";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/catalog"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Volver al catálogo
        </Link>
        <div className="grid gap-5 md:grid-cols-[200px_1fr]">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-xl border border-border/80 bg-muted shadow-[var(--shadow-md)]">
            <Image
              src={imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="200px"
              unoptimized
            />
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={data.status} />
              {data.isIndicativePricing ? (
                <Badge variant="outline">Precios orientativos</Badge>
              ) : null}
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.gameName}
            </h1>
            <p className="text-sm text-muted-foreground">{data.name}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <Detail term="Plataforma" value={data.platformName} />
              <Detail term="Generación" value={`Gen ${data.generation}`} />
              <Detail term="Año" value={data.releaseYear ? String(data.releaseYear) : "—"} />
              <Detail term="Región" value={data.regionName} />
              <Detail term="Idioma" value={data.language.toUpperCase()} />
              <Detail term="Edición" value={data.editionLabel} />
            </dl>
            {data.description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {data.description}
              </p>
            ) : null}
            {data.completenessPercent !== null ? (
              <p className="text-sm">
                Completitud de tu copia principal:{" "}
                <span className="font-medium tabular-nums">
                  {data.completenessPercent}%
                </span>
              </p>
            ) : null}
            <Link
              href={`/games/${data.id}?action=add-copy`}
              className="inline-flex h-8 items-center rounded-lg bg-primary px-2.5 text-sm text-primary-foreground hover:bg-primary/80"
            >
              Añadir copia
            </Link>
          </div>
        </div>
      </div>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tus copias</CardTitle>
          <CardDescription>
            Puedes tener varias copias; solo la principal cuenta para el progreso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.ownedCopies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no tienes copias de esta edición.
            </p>
          ) : (
            data.ownedCopies.map((copy) => (
              <Link
                key={copy.id}
                href={`/collection/${copy.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-primary/40"
              >
                <div>
                  <p className="font-medium">
                    {COPY_CONDITION_LABELS[copy.condition as CopyCondition]}
                    {copy.isPrimary ? " · Principal" : " · Duplicado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Completitud{" "}
                    {copy.completenessPercent === null
                      ? "sin checklist"
                      : `${copy.completenessPercent}%`}
                    {copy.pricePaidCents !== null
                      ? ` · ${formatCentsEs(copy.pricePaidCents, data.currency)}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs text-primary">Ver</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <PriceCard
          label="Referencia"
          cents={data.referencePriceCents}
          currency={data.currency}
        />
        <PriceCard
          label="Objetivo"
          cents={data.targetPriceCents}
          currency={data.currency}
        />
        <PriceCard
          label="Máximo"
          cents={data.maxPriceCents}
          currency={data.currency}
        />
      </div>

      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Componentes esperados</CardTitle>
          <CardDescription>
            Checklist flexible asociado a esta edición
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.components.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay componentes definidos.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {data.components.map((component) => (
                <li
                  key={component.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{component.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {component.isRequired ? "Obligatorio" : "Opcional"} · peso{" "}
                      {component.weight}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {COMPONENT_IMPORTANCE_LABELS[component.importance]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Anuncios guardados</CardTitle>
            <CardDescription>Relacionados con esta edición</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.listings.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-sm text-muted-foreground">
                No hay anuncios guardados todavía.
              </p>
            ) : (
              data.listings.map((listing) => (
                <a
                  key={listing.id}
                  href={listing.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">{listing.title}</p>
                    <span className="shrink-0 tabular-nums">
                      {formatCentsEs(listing.totalCents, listing.currency)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {MARKETPLACE_LABELS[listing.platform]} ·{" "}
                    {LISTING_STATUS_LABELS[listing.status]} ·{" "}
                    {formatDateEs(listing.savedAt)}
                  </p>
                </a>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Historial de precios</CardTitle>
            <CardDescription>Observaciones manuales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.priceHistory.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-sm text-muted-foreground">
                Todavía no hay observaciones de precio.
              </p>
            ) : (
              data.priceHistory.map((observation) => (
                <div
                  key={observation.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium tabular-nums">
                      {formatCentsEs(observation.priceCents, observation.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateEs(observation.observedAt)} ·{" "}
                      {COMPLETENESS_SEGMENT_LABELS[observation.completenessSegment]}
                      {observation.isIndicative ? " · orientativo" : ""}
                    </p>
                  </div>
                  {observation.platform ? (
                    <Badge variant="outline">
                      {MARKETPLACE_LABELS[observation.platform]}
                    </Badge>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{term}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function PriceCard({
  label,
  cents,
  currency,
}: {
  label: string;
  cents: number | null;
  currency: string;
}) {
  return (
    <Card className="border-border/80">
      <CardContent className="space-y-1 pt-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold tabular-nums">
          {cents === null ? "—" : formatCentsEs(cents, currency)}
        </p>
      </CardContent>
    </Card>
  );
}
