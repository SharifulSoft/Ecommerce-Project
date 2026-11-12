

export default function ProfileReturns() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Returns & Cancellations</h2>
      
      <div className="flex flex-col items-center justify-center py-12 md:py-16">
        <div className="text-5xl md:text-6xl mb-4">↩️</div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No Returns or Cancellations</h3>
        <p className="text-gray-600 text-center text-sm md:text-base mb-6 max-w-sm">
          You don't have any returns or cancellations yet. Your order history will appear here.
        </p>
        <a
          href="/"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm md:text-base"
        >
          Back to Shopping
        </a>
      </div>
    </div>
  );
}

