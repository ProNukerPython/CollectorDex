import type { CollectionStatus } from "@/domain/catalog/types";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<CollectionStatus, string> = {
  owned: "Conseguido",
  wishlist: "Wishlist",
  pending: "Pendiente",
};

const VARIANTS: Record<
  CollectionStatus,
  "default" | "secondary" | "outline"
> = {
  owned: "default",
  wishlist: "secondary",
  pending: "outline",
};

export function StatusBadge({ status }: { status: CollectionStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
