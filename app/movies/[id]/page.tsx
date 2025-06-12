// app/movies/[id]/page.tsx

import MovieDetailView from "@/components/MovieDetailView";

type Props = {
  params: { id: string };
};

export default function MovieDetailPage({ params }: Props) {
  return <MovieDetailView id={params.id} />;
}