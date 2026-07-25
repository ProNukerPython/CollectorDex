import { notFound } from "next/navigation";
import { EditionDetailView } from "@/features/catalog/edition-detail-view";
import { requireUser } from "@/server/session";
import { getEditionDetail } from "@/services/catalog";

type EditionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditionDetailPage({ params }: EditionPageProps) {
  const user = await requireUser();
  const { slug } = await params;
  const data = await getEditionDetail(user.id, slug);
  if (!data) {
    notFound();
  }
  return <EditionDetailView data={data} />;
}
