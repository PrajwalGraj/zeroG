// Public configuration accessible in the browser
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// Log for debugging (only in development)
if (typeof window !== 'undefined' && !googleClientId) {
  console.warn('⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in .env.local');
  console.warn('Please add: NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id');
}

export const publicConfig = {
  googleClientId,
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'ZeroG',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
