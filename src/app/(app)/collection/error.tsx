"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CollectionError({ reset }: { reset: () => void }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>No se pudo cargar la colección</CardTitle>
        <CardDescription>
          Ha ocurrido un error al obtener tus copias.
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
