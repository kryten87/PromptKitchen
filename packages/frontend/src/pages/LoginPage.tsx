/**
 * LoginPage
 * UI for user authentication entry point.
 * Provides a button for Google OAuth login (button logic added in next step).
 */

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Prompt Kitchen</h1>
        <p className="mb-8 text-gray-600 text-center">
          Sign in to manage your LLM prompts and test suites.
        </p>
        <button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition text-gray-800 font-medium shadow-sm cursor-not-allowed"
          disabled
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"/><path fill="#FBBC05" d="M24 45c5.1 0 9.8-1.7 13.5-4.7l-6.2-5.1C29.2 36.2 26.7 37 24 37c-6.1 0-10.7-2.9-13.2-7.1l-7 5.4C7.1 41.9 14.9 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.7 7.5-11.7 7.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.2 2.6l6.2-6.2C37.1 5.1 30.9 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"/></g></svg>
          Login with Google (coming next)
        </button>
      </div>
      <footer className="mt-8 text-gray-400 text-xs">&copy; {new Date().getFullYear()} Prompt Kitchen</footer>
    </div>
  );
}
