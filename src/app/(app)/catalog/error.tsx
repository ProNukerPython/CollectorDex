"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CatalogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>No se pudo cargar el catálogo</CardTitle>
        <CardDescription>
          Revisa los filtros o inténtalo de nuevo en unos segundos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={reset}>
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}
