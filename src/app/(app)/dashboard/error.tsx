"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>No se pudo cargar el dashboard</CardTitle>
        <CardDescription>
          Ha ocurrido un error al obtener las estadísticas de tu colección.
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
