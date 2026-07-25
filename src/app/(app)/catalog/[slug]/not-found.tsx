import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EditionNotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edición no encontrada</CardTitle>
        <CardDescription>
          Esa ficha no existe en el catálogo o el enlace no es válido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href="/catalog"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm text-primary-foreground hover:bg-primary/80"
        >
          Volver al catálogo
        </Link>
      </CardContent>
    </Card>
  );
}
