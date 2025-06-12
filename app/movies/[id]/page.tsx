// app/movies/[id]/page.tsx

import MovieDetailView from "@/components/MovieDetailView";

// ▼▼▼▼▼ この一行を追加します ▼▼▼▼▼
export const dynamic = 'force-dynamic';

type Props = {
  params: { id: string };
};

export default function MovieDetailPage({ params }: Props) {
  return <MovieDetailView id={params.id} />;
}