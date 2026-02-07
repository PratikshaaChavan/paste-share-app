import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPasteWithoutIncrement, getCurrentTime } from '@/lib/db';

export default async function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
const headersList = await headers();
const currentTime = getCurrentTime(headersList);
  const paste = await getPasteWithoutIncrement(id, currentTime);
  if (!paste) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Paste View</h1>
          </div>
          <div className="p-6">
            <div className="bg-gray-100 rounded-md p-4 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                {paste.content}
              </pre>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              {paste.maxViews !== null && (
                <p>
                  Views: {paste.viewCount} / {paste.maxViews}
                </p>
              )}
              {paste.expiresAt && (
                <p>
                  Expires: {new Date(paste.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
