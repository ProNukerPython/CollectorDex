import Image from "next/image";
import Link from "next/link";
import { Heart, Pencil } from "lucide-react";
import type { CatalogEditionItem } from "@/domain/catalog/types";
import { StatusBadge } from "@/features/catalog/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatCentsEs } from "@/lib/format";
import { WISHLIST_PRIORITY_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function CatalogCard({
  item,
  view,
}: {
  item: CatalogEditionItem;
  view: "grid" | "list";
}) {
  const href = `/catalog/${item.slug}`;
  const imageSrc = item.imageUrl ?? "/placeholders/games/generic.svg";

  if (view === "list") {
    return (
      <article className="flex gap-3 rounded-xl border border-border/80 bg-card/60 p-3 shadow-[var(--shadow-sm)] transition-colors hover:border-primary/40">
        <Link
          href={href}
          className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted"
        >
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        </Link>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={href} className="min-w-0 hover:text-primary">
              <h2 className="truncate font-medium">{item.gameName}</h2>
              <p className="truncate text-xs text-muted-foreground">
                {item.editionLabel} · {item.platformName}
              </p>
            </Link>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <StatusBadge status={item.status} />
              {item.wishlistPriority ? (
                <Badge variant="outline">
                  {WISHLIST_PRIORITY_LABELS[item.wishlistPriority]}
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Gen {item.generation}</span>
            <span>{item.regionName}</span>
            {item.referencePriceCents !== null ? (
              <span className="tabular-nums">
                Ref. {formatCentsEs(item.referencePriceCents, item.currency)}
              </span>
            ) : null}
            {item.targetPriceCents !== null ? (
              <span className="tabular-nums">
                Obj. {formatCentsEs(item.targetPriceCents, item.currency)}
              </span>
            ) : null}
            {item.completenessPercent !== null ? (
              <span>{item.completenessPercent}% completo</span>
            ) : null}
          </div>
          <CatalogWishlistAction item={item} />
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-[var(--shadow-sm)] transition-colors hover:border-primary/40",
      )}
    >
      <Link href={href} className="relative aspect-[3/4] bg-muted">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized
        />
        <div className="absolute left-2 top-2">
          <StatusBadge status={item.status} />
        </div>
      </Link>
      <div className="space-y-2 p-3">
        <div>
          <Link
            href={href}
            className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
          >
            {item.gameName}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.editionLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span>{item.platformName}</span>
          <span>·</span>
          <span>Gen {item.generation}</span>
          <span>·</span>
          <span>{item.regionName}</span>
        </div>
        <div className="space-y-0.5 text-xs">
          {item.referencePriceCents !== null ? (
            <p className="tabular-nums">
              <span className="text-muted-foreground">Ref. </span>
              {formatCentsEs(item.referencePriceCents, item.currency)}
            </p>
          ) : null}
          {item.targetPriceCents !== null ? (
            <p className="tabular-nums">
              <span className="text-muted-foreground">Obj. </span>
              {formatCentsEs(item.targetPriceCents, item.currency)}
            </p>
          ) : null}
          {item.completenessPercent !== null ? (
            <p className="text-muted-foreground">
              Completitud {item.completenessPercent}%
            </p>
          ) : null}
        </div>
        <CatalogWishlistAction item={item} />
      </div>
    </article>
  );
}

function CatalogWishlistAction({ item }: { item: CatalogEditionItem }) {
  if (item.isWishlisted && item.wishlistEntryId) {
    return (
      <Link
        href={`/wishlist/${item.wishlistEntryId}/edit`}
        className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-xs font-medium hover:bg-muted"
      >
        <Pencil className="size-3" />
        Editar wishlist
      </Link>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/wishlist/new?editionId=${item.id}`}
        className="inline-flex h-7 items-center gap-1 rounded-lg border border-border px-2 text-xs font-medium hover:bg-muted"
      >
        <Heart className="size-3" />
        Añadir a wishlist
      </Link>
      {item.isOwned ? (
        <span className="text-xs text-muted-foreground">Ya en colección</span>
      ) : null}
    </div>
  );
}
