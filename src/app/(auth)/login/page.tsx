import { Gamepad2 } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-md)]">
            <Gamepad2 className="size-6" aria-hidden />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            CollectorDex
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu colección física de Pokémon, con criterio de mercado.
          </p>
        </div>

        <Card className="border-border/80 shadow-[var(--shadow-md)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Iniciar sesión</CardTitle>
            <CardDescription>
              Usa la cuenta demo local para explorar el MVP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Demo: <span className="text-foreground">demo@collectordex.local</span> /{" "}
              <span className="text-foreground">collectordex</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
