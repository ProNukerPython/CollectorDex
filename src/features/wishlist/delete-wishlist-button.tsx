"use client";

import { Trash2 } from "lucide-react";
import { deleteWishlistEntryAction } from "@/features/wishlist/actions";
import { Button } from "@/components/ui/button";

export function DeleteWishlistButton({ entryId }: { entryId: string }) {
  return (
    <form
      action={deleteWishlistEntryAction.bind(null, entryId)}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "¿Eliminar esta entrada de la wishlist? Esta acción no borra ninguna copia de tu colección.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-3.5" />
        Eliminar
      </Button>
    </form>
  );
}
