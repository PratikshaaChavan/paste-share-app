export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Paste not found</p>
        <p className="text-gray-500">This paste may have expired or reached its view limit.</p>
      </div>
    </div>
  );
}
