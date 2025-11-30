# Google OAuth Setup Guide for Photon Integration

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "ZeroG" and click "Create"

## Step 2: Enable Google Sign-In API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity Services"
3. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: ZeroG
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Skip for now
   - Test users: Add your email
   - Click "Save and Continue"

4. Back to "Create OAuth client ID":
   - Application type: **Web application**
   - Name: ZeroG Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:3001` (if needed)
   - Authorized redirect URIs:
     - `http://localhost:3000/signin`
     - `http://localhost:3000`
   - Click "Create"

## Step 4: Get Your Client ID

1. You'll see a dialog with your **Client ID** and **Client Secret**
2. Copy the **Client ID** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
3. Open `.env.local` in your project
4. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
```

## Step 5: Restart Your Dev Server

```bash
npm run dev
```

## Step 6: Test the Integration

1. Go to `http://localhost:3000/signin`
2. Make sure the "Photon Login" tab is selected
3. You should see a "Sign in with Google" button
4. Click it and sign in with your Google account
5. After successful sign-in, you'll be redirected to the dashboard

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure you added `http://localhost:3000` to "Authorized JavaScript origins"
- Make sure you added `http://localhost:3000/signin` to "Authorized redirect URIs"

### "Google Sign-In button not showing"
- Check browser console for errors
- Make sure you replaced `YOUR_GOOGLE_CLIENT_ID_HERE` in `.env.local`
- Make sure you restarted the dev server after changing `.env.local`

### "Photon login failed"
- Check that your Photon API key is correct in `.env.local`
- Check browser Network tab to see the API response
- Make sure the Photon API is accessible

## Production Setup

When deploying to production:

1. Add your production domain to Google Cloud Console:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/signin`

2. Update `.env.local` (or `.env.production`):
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## Security Notes

- ✅ `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is safe to expose (public variable)
- ❌ Never expose `PHOTON_API_KEY` (server-side only)
- ✅ Google Sign-In uses secure JWT tokens
- ✅ All Photon API calls are proxied through Next.js API routes

## What Happens Behind the Scenes

1. User clicks "Sign in with Google"
2. Google authenticates the user and returns a JWT token
3. Your app sends this JWT to `/api/photon/login`
4. Next.js API route exchanges Google JWT for Photon access token (using secret API key)
5. Photon access token is returned to the client
6. User is logged in and can earn rewards!

🎉 You're all set!
