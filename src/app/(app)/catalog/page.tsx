import { CatalogView } from "@/features/catalog/catalog-view";
import { parseCatalogFilters } from "@/schemas/catalog";
import { requireUser } from "@/server/session";
import { getCatalogPageData } from "@/services/catalog";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const filters = parseCatalogFilters(params);
  const data = await getCatalogPageData(user.id, filters);
  return <CatalogView data={data} />;
}
