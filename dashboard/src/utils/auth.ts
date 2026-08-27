const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/pbs-build-observatory/';

export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'read:org repo',
    state: generateRandomState(),
  });
  return `https://github.com/login/oauth/authorize?${params}`;
};

export const generateRandomState = (): string => {
  return Math.random().toString(36).substring(7);
};

export const saveToken = (token: string): void => {
  localStorage.setItem('github_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('github_token');
};

export const clearToken = (): void => {
  localStorage.removeItem('github_token');
};

export const exchangeCodeForToken = async (code: string): Promise<string> => {
  // In production, this should call your backend proxy to exchange the code
  // GitHub doesn't allow CORS for the token exchange endpoint
  // For now, we'll use the GitHub Device Flow or ask users to generate a PAT

  // This is a placeholder - see README for setup instructions
  throw new Error('Token exchange not implemented. Please use a Personal Access Token.');
};
