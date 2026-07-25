"use client";

import { useTransition } from "react";
import { deleteOwnedCopyAction } from "@/features/collection/actions";
import { Button } from "@/components/ui/button";

export function DeleteCopyButton({
  copyId,
  relatedPurchaseCount,
}: {
  copyId: string;
  relatedPurchaseCount: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={() => {
        const purchasesNote =
          relatedPurchaseCount > 0
            ? ` Se desvincularán ${relatedPurchaseCount} compra(s).`
            : "";
        const ok = window.confirm(
          `¿Eliminar esta copia y su checklist de componentes?${purchasesNote} Esta acción no se puede deshacer.`,
        );
        if (!ok) return;
        startTransition(async () => {
          await deleteOwnedCopyAction(copyId);
        });
      }}
    >
      {pending ? "Eliminando…" : "Eliminar definitivamente"}
    </Button>
  );
}
