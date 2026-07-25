import { Skeleton } from "@/components/ui/skeleton";

export default function EditionDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <Skeleton className="aspect-[3/4] w-full max-w-[200px] rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
