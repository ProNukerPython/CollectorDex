import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <AppNav userName={session.user.name ?? session.user.email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24">
        {children}
      </main>
    </>
  );
}
