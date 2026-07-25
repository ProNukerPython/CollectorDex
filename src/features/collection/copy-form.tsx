"use client";

import { useActionState, useMemo, useState } from "react";
import type { ComponentPresence, CopyCondition } from "@prisma/client";
import {
  createOwnedCopyAction,
  updateOwnedCopyAction,
  type OwnedCopyActionState,
} from "@/features/collection/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AUTHENTICITY_LABELS,
  COMPONENT_PRESENCE_LABELS,
  COPY_CONDITION_LABELS,
  MARKETPLACE_LABELS,
} from "@/lib/labels";
import { centsToEuros } from "@/domain/money/cents";

export type CopyFormEditionOption = {
  id: string;
  label: string;
  language: string;
  regionName: string;
};

export type CopyFormChecklistItem = {
  componentDefinitionId: string;
  name: string;
  description: string | null;
  weight: number;
  isRequired: boolean;
  presence?: ComponentPresence;
  condition?: CopyCondition | null;
  notes?: string | null;
};

export type CopyFormInitial = {
  gameEditionId: string;
  condition: CopyCondition;
  authenticity: keyof typeof AUTHENTICITY_LABELS;
  regionLabel: string;
  language: string;
  pricePaidCents: number | null;
  estimatedValueCents: number | null;
  currency: "EUR" | "USD" | "GBP";
  purchasedAt: string;
  purchasePlatform: keyof typeof MARKETPLACE_LABELS | "";
  sellerName: string;
  listingUrl: string;
  serialNumber: string;
  notes: string;
  isPrimary: boolean;
  photoUrls: string;
  checklist: CopyFormChecklistItem[];
};

const initialState: OwnedCopyActionState = {};

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30";

export function CopyForm({
  mode,
  copyId,
  editions,
  initial,
  checklistByEdition,
  wishlistEntryId,
}: {
  mode: "create" | "edit";
  copyId?: string;
  editions: CopyFormEditionOption[];
  initial: CopyFormInitial;
  checklistByEdition: Record<string, CopyFormChecklistItem[]>;
  wishlistEntryId?: string;
}) {
  const action =
    mode === "create"
      ? createOwnedCopyAction
      : updateOwnedCopyAction.bind(null, copyId!);

  const [state, formAction, pending] = useActionState(action, initialState);
  const [editionId, setEditionId] = useState(initial.gameEditionId);
  const checklist = useMemo(
    () => checklistByEdition[editionId] ?? initial.checklist,
    [checklistByEdition, editionId, initial.checklist],
  );

  const selectedEdition = editions.find((edition) => edition.id === editionId);

  return (
    <form action={formAction} className="space-y-6">
      {wishlistEntryId ? (
        <input type="hidden" name="wishlistEntryId" value={wishlistEntryId} />
      ) : null}
      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Edición y estado
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
              onChange={(event) => {
                setEditionId(event.target.value);
              }}
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="condition">Estado general</Label>
            <select
              id="condition"
              name="condition"
              className={selectClass}
              defaultValue={initial.condition}
            >
              {Object.entries(COPY_CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="authenticity">Autenticidad</Label>
            <select
              id="authenticity"
              name="authenticity"
              className={selectClass}
              defaultValue={initial.authenticity}
            >
              {Object.entries(AUTHENTICITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="regionLabel">Región</Label>
            <Input
              id="regionLabel"
              name="regionLabel"
              defaultValue={initial.regionLabel || selectedEdition?.regionName || ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="language">Idioma</Label>
            <Input
              id="language"
              name="language"
              defaultValue={initial.language || selectedEdition?.language || "es"}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-4">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Compra y valoración
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pricePaidEuros">Precio pagado (€)</Label>
            <Input
              id="pricePaidEuros"
              name="pricePaidEuros"
              type="number"
              min={0}
              step="0.01"
              defaultValue={
                initial.pricePaidCents !== null
                  ? String(centsToEuros(initial.pricePaidCents))
                  : ""
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="estimatedValueEuros">Valor estimado (€)</Label>
            <Input
              id="estimatedValueEuros"
              name="estimatedValueEuros"
              type="number"
              min={0}
              step="0.01"
              defaultValue={
                initial.estimatedValueCents !== null
                  ? String(centsToEuros(initial.estimatedValueCents))
                  : ""
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Moneda</Label>
            <select
              id="currency"
              name="currency"
              className={selectClass}
              defaultValue={initial.currency}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchasedAt">Fecha de compra</Label>
            <Input
              id="purchasedAt"
              name="purchasedAt"
              type="date"
              defaultValue={initial.purchasedAt}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purchasePlatform">Plataforma de compra</Label>
            <select
              id="purchasePlatform"
              name="purchasePlatform"
              className={selectClass}
              defaultValue={initial.purchasePlatform}
            >
              <option value="">Sin especificar</option>
              {Object.entries(MARKETPLACE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sellerName">Vendedor</Label>
            <Input
              id="sellerName"
              name="sellerName"
              defaultValue={initial.sellerName}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="listingUrl">URL del anuncio</Label>
            <Input
              id="listingUrl"
              name="listingUrl"
              type="url"
              placeholder="https://"
              defaultValue={initial.listingUrl}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="serialNumber">N.º de serie / código</Label>
            <Input
              id="serialNumber"
              name="serialNumber"
              defaultValue={initial.serialNumber}
            />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isPrimary"
                value="true"
                defaultChecked={initial.isPrimary}
                className="size-4 rounded border-input"
              />
              Marcar como copia principal
            </label>
          </div>
          {wishlistEntryId && mode === "create" ? (
            <div className="flex items-end gap-2 pb-1 sm:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="deleteWishlistAfterCreate"
                  value="true"
                  defaultChecked
                  className="size-4 rounded border-input"
                />
                Eliminar de la wishlist después de crear la copia
              </label>
            </div>
          ) : null}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={initial.notes}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="photoUrls">URLs de imágenes (una por línea)</Label>
            <Textarea
              id="photoUrls"
              name="photoUrls"
              rows={3}
              defaultValue={initial.photoUrls}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border/80 bg-card/40 p-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Componentes
          </h2>
          <p className="text-sm text-muted-foreground">
            Checklist flexible de esta edición. Los opcionales no penalizan la
            completitud principal.
          </p>
        </div>
        {checklist.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/80 px-3 py-6 text-center text-sm text-muted-foreground">
            Esta edición no tiene checklist configurado.
          </p>
        ) : (
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li
                key={item.componentDefinitionId}
                className="rounded-lg border border-border/60 p-3"
              >
                <input
                  type="hidden"
                  name="componentDefinitionId"
                  value={item.componentDefinitionId}
                />
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.isRequired ? "Obligatorio" : "Opcional"} · peso{" "}
                      {item.weight}
                      {item.description ? ` · ${item.description}` : ""}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor={`presence_${item.componentDefinitionId}`}>
                      Presencia
                    </Label>
                    <select
                      id={`presence_${item.componentDefinitionId}`}
                      name={`presence_${item.componentDefinitionId}`}
                      className={selectClass}
                      defaultValue={item.presence ?? "UNKNOWN"}
                    >
                      {Object.entries(COMPONENT_PRESENCE_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`componentCondition_${item.componentDefinitionId}`}
                    >
                      Estado
                    </Label>
                    <select
                      id={`componentCondition_${item.componentDefinitionId}`}
                      name={`componentCondition_${item.componentDefinitionId}`}
                      className={selectClass}
                      defaultValue={item.condition ?? ""}
                    >
                      <option value="">—</option>
                      {Object.entries(COPY_CONDITION_LABELS).map(
                        ([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={`componentNotes_${item.componentDefinitionId}`}
                    >
                      Notas
                    </Label>
                    <Input
                      id={`componentNotes_${item.componentDefinitionId}`}
                      name={`componentNotes_${item.componentDefinitionId}`}
                      defaultValue={item.notes ?? ""}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending
          ? "Guardando…"
          : mode === "create"
            ? "Guardar copia"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
