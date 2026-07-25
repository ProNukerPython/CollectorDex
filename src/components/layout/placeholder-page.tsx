import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <Badge variant="secondary">Próximamente</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">En construcción</CardTitle>
          <CardDescription>
            La autenticación, el seed y la navegación ya están listos.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Esta pantalla es un placeholder de la Fase 1 para validar el layout
          mobile-first.
        </CardContent>
      </Card>
    </div>
  );
}
