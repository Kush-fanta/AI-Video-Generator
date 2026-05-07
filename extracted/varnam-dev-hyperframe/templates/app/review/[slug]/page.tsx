import { redirect } from "next/navigation";

interface ReviewSlugPageProps {
  params: {
    slug: string;
  };
}

export default function ReviewSlugPage({ params }: ReviewSlugPageProps) {
  redirect(`/qc?slug=${encodeURIComponent(params.slug)}`);
}
