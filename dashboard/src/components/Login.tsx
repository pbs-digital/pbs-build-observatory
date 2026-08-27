import { useState } from 'react';
import { saveToken } from '../utils/auth';

interface LoginProps {
  onLogin: (token: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }
    saveToken(token);
    onLogin(token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PBS Build Observatory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your GitHub Personal Access Token
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="sr-only">
              GitHub Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign in
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p className="font-semibold mb-2">How to create a token:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
              <li>Click "Generate new token (classic)"</li>
              <li>Select scopes: <code className="bg-gray-100 px-1">repo</code> and <code className="bg-gray-100 px-1">read:org</code></li>
              <li>Generate and copy the token</li>
            </ol>
            <p className="mt-2">
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,read:org&description=PBS%20Build%20Observatory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                → Create token now
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
