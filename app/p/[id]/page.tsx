import { notFound } from 'next/navigation';
import PasteView from '@/components/PasteView';

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pastes/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  return <PasteView paste={data} pasteId={id} />;
}