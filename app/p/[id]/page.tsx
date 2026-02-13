import { notFound } from 'next/navigation';

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/pastes/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    notFound();
  }

  const data = await response.json();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <pre className="whitespace-pre-wrap break-words">
            {data.content}
          </pre>
          {data.remaining_views && (
            <p className="mt-4 text-sm text-gray-600">
              Remaining views: {data.remaining_views}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}