"use client";

import {
  BarChart3,
  Bookmark,
  Gamepad2,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalog", label: "Catálogo", icon: Search },
  { href: "/collection", label: "Colección", icon: Package },
  { href: "/wishlist", label: "Wishlist", icon: Bookmark },
  { href: "/listings", label: "Anuncios", icon: Tag },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/negotiator", label: "Negociador", icon: Handshake },
] as const;

export function AppNav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
            <Gamepad2 className="size-4" aria-hidden />
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            CollectorDex
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden max-w-36 truncate text-xs text-muted-foreground sm:inline">
            {userName ?? "Usuario"}
          </span>
          <form action={signOutAction} className="hidden sm:block">
            <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
              <LogOut className="size-3.5" aria-hidden />
              Salir
            </Button>
          </form>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-4">
              <SheetHeader>
                <SheetTitle className="font-[family-name:var(--font-display)]">
                  Menú
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Móvil">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm",
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <form action={signOutAction} className="mt-6">
                <Button type="submit" variant="outline" className="w-full gap-2">
                  <LogOut className="size-4" aria-hidden />
                  Cerrar sesión
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
