"use client";

import { useActionState, useMemo, useState } from "react";
import type { CopyCondition, WishlistPriority } from "@prisma/client";
import {
  createWishlistEntryAction,
  updateWishlistEntryAction,
  type WishlistActionState,
} from "@/features/wishlist/actions";
import type { WishlistFormOption } from "@/services/wishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { centsToEuros } from "@/domain/money/cents";
import {
  COPY_CONDITION_LABELS,
  WISHLIST_PRIORITY_LABELS,
} from "@/lib/labels";

export type WishlistFormInitial = {
  id?: string;
  gameEditionId: string;
  priority: WishlistPriority;
  targetPriceCents: number | null;
  maxPriceCents: number | null;
  minCondition: CopyCondition | null;
  desiredRegion: string;
  notes: string;
  requiredComponentIds: string[];
};

const initialState: WishlistActionState = {};
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="text-xs text-destructive" role="alert">
      {errors[0]}
    </p>
  );
}

function formatEurosInput(cents: number | null) {
  if (cents === null) return "";
  return String(centsToEuros(cents)).replace(".", ",");
}

export function WishlistForm({
  mode,
  entryId,
  editions,
  initial,
}: {
  mode: "create" | "edit";
  entryId?: string;
  editions: WishlistFormOption[];
  initial: WishlistFormInitial;
}) {
  const action =
    mode === "create"
      ? createWishlistEntryAction
      : updateWishlistEntryAction.bind(null, entryId!);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [editionId, setEditionId] = useState(initial.gameEditionId);

  const selectedEdition = editions.find((edition) => edition.id === editionId);
  const checklist = selectedEdition?.checklist ?? [];
  const requiredIds = useMemo(
    () => new Set(initial.requiredComponentIds),
    [initial.requiredComponentIds],
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Objetivo de compra
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="gameEditionId">Edición</Label>
            <select
              id="gameEditionId"
              name="gameEditionId"
              required
              className={selectClass}
              value={editionId}
              disabled={mode === "edit"}
              onChange={(event) => setEditionId(event.target.value)}
            >
              <option value="" disabled>
                Selecciona una edición
              </option>
              {editions.map((edition) => (
                <option key={edition.id} value={edition.id}>
                  {edition.label}
                </option>
              ))}
            </select>
            {mode === "edit" ? (
              <input type="hidden" name="gameEditionId" value={editionId} />
            ) : null}
            <FieldError errors={state.fieldErrors?.gameEditionId} />
          </div>

          {selectedEdition?.isOwnedPrimary ? (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm sm:col-span-2">
              <p className="font-medium">Ya tienes esta edición como principal.</p>
              <label className="inline-flex items-start gap-2">
                <input
                  type="checkbox"
                  name="allowOwnedPrimary"
                  value="true"
                  className="mt-0.5 size-4 rounded border-input"
                  defaultChecked={mode === "edit"}
                />
                <span>
                  Confirmo que busco una segunda copia o una mejora de estado.
                </span>
              </label>
            </div>
          ) : (
            <input type="hidden" name="allowOwnedPrimary" value="true" />
          )}

          <div className="space-y-1.5">
            <Label htmlFor="priority">Prioridad</Label>
            <select
              id="priority"
              name="priority"
              className={selectClass}
              defaultValue={initial.priority}
            >
              {Object.entries(WISHLIST_PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minCondition">Condición mínima</Label>
            <select
              id="minCondition"
              name="minCondition"
              className={selectClass}
              defaultValue={initial.minCondition ?? ""}
            >
              <option value="">Sin mínimo</option>
              {Object.entries(COPY_CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetPriceEuros">Precio objetivo (€)</Label>
            <Input
              id="targetPriceEuros"
              name="targetPriceEuros"
              inputMode="decimal"
              placeholder="24,99"
              defaultValue={formatEurosInput(initial.targetPriceCents)}
            />
            <FieldError errors={state.fieldErrors?.targetPriceEuros} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxPriceEuros">Precio máximo (€)</Label>
            <Input
              id="maxPriceEuros"
              name="maxPriceEuros"
              inputMode="decimal"
              placeholder="39,99"
              defaultValue={formatEurosInput(initial.maxPriceCents)}
            />
            <FieldError errors={state.fieldErrors?.maxPriceEuros} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="desiredRegion">Región deseada</Label>
            <Input
              id="desiredRegion"
              name="desiredRegion"
              defaultValue={initial.desiredRegion || selectedEdition?.regionName || ""}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={1200}
              defaultValue={initial.notes}
            />
            <FieldError errors={state.fieldErrors?.notes} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Componentes obligatorios
          </h2>
          <p className="text-sm text-muted-foreground">
            Solo puedes marcar componentes definidos en el checklist de esta edición.
          </p>
        </div>
        {checklist.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-sm text-muted-foreground">
            Esta edición no tiene checklist configurado.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {checklist.map((component) => (
              <label
                key={component.componentDefinitionId}
                className="flex items-start gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="requiredComponentIds"
                  value={component.componentDefinitionId}
                  defaultChecked={requiredIds.has(component.componentDefinitionId)}
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>
                  <span className="font-medium">{component.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {component.isRequired ? "Checklist obligatorio" : "Checklist opcional"}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Añadir a wishlist"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
