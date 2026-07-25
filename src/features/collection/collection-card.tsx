import Image from "next/image";
import Link from "next/link";
import type { CollectionListItem } from "@/services/collection";
import { Badge } from "@/components/ui/badge";
import { formatCentsEs, formatDateEs } from "@/lib/format";
import {
  AUTHENTICITY_LABELS,
  COPY_CONDITION_LABELS,
} from "@/lib/labels";

export function CollectionCard({
  item,
  view,
}: {
  item: CollectionListItem;
  view: "grid" | "list";
}) {
  const href = `/collection/${item.id}`;
  const imageSrc = item.imageUrl ?? "/placeholders/games/generic.svg";

  const meta = (
    <>
      <div className="flex flex-wrap gap-1">
        <Badge variant={item.isPrimary ? "default" : "secondary"}>
          {item.isPrimary ? "Principal" : "Duplicado"}
        </Badge>
        <Badge variant="outline">{COPY_CONDITION_LABELS[item.condition]}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        {item.platformName} · {item.regionName}
      </p>
      <p className="text-xs text-muted-foreground">
        {AUTHENTICITY_LABELS[item.authenticity]}
      </p>
      <div className="space-y-0.5 text-xs">
        <p className="tabular-nums">
          Pagado{" "}
          {item.pricePaidCents === null
            ? "—"
            : formatCentsEs(item.pricePaidCents, item.currency)}
        </p>
        <p className="tabular-nums">
          Estimado{" "}
          {item.estimatedValueCents === null
            ? "—"
            : formatCentsEs(item.estimatedValueCents, item.currency)}
        </p>
        <p>
          Completitud{" "}
          {item.completenessPercent === null
            ? "sin checklist"
            : `${item.completenessPercent}%`}
        </p>
        {item.missingComponents.length > 0 ? (
          <p className="text-muted-foreground">
            Faltan: {item.missingComponents.slice(0, 3).join(", ")}
            {item.missingComponents.length > 3 ? "…" : ""}
          </p>
        ) : null}
        {item.purchasedAt ? (
          <p className="text-muted-foreground">
            Compra {formatDateEs(item.purchasedAt)}
          </p>
        ) : null}
      </div>
    </>
  );

  if (view === "list") {
    return (
      <Link
        href={href}
        className="flex gap-3 rounded-xl border border-border/80 bg-card/60 p-3 shadow-[var(--shadow-sm)] hover:border-primary/40"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image src={imageSrc} alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate font-medium">{item.gameName}</h2>
          {meta}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-[var(--shadow-sm)] hover:border-primary/40"
    >
      <div className="relative aspect-[3/4] bg-muted">
        <Image src={imageSrc} alt="" fill className="object-cover" unoptimized />
      </div>
      <div className="space-y-2 p-3">
        <h2 className="line-clamp-2 text-sm font-medium">{item.gameName}</h2>
        {meta}
      </div>
    </Link>
  );
}
