export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">
        OpenSource <span className="text-blue-600">Matchmaker</span>
      </h1>
      
      <div className="w-full max-w-2xl">
        {/* Search Bar Placeholder */}
        <input 
          type="text" 
          placeholder="Describe the issue you want to fix..." 
          className="w-full p-4 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
        />
        
        {/* Results Placeholder */}
        <div className="mt-8 space-y-4">
            <p className="text-gray-500 text-center">No issues found yet.</p>
        </div>
      </div>
    </main>
  );
}