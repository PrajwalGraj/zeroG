/**
 * EXAMPLE USAGE: Photon Integration
 * 
 * This file demonstrates how to use the Photon gamification system
 * in your components.
 */

'use client';

import { usePhoton } from '@/hooks/usePhoton';
import { Button } from '@/components/ui/button';

export default function PhotonExample() {
  const { photonToken, photonUserId, isLoading, login, track } = usePhoton();

  // Example 1: Login with Google JWT
  const handleGoogleLogin = async () => {
    // Assume you have a Google JWT from authentication
    const googleJWT = 'YOUR_GOOGLE_JWT_HERE';
    
    try {
      await login(googleJWT);
      console.log('Photon logged in!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Example 2: Track a token launch event
  const handleTokenLaunch = async () => {
    try {
      await track('token_launch', {
        token_name: 'MyToken',
        token_symbol: 'MTK',
        initial_supply: 1000000,
      });
      console.log('Token launch tracked!');
    } catch (error) {
      console.error('Tracking failed:', error);
    }
  };

  // Example 3: Track wallet connection
  const handleWalletConnect = async () => {
    try {
      await track('wallet_connect', {
        wallet_type: 'Petra',
      });
      console.log('Wallet connection tracked!');
    } catch (error) {
      console.error('Tracking failed:', error);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Photon Integration Example</h1>

      <div className="space-y-2">
        <p>Photon Status: {photonToken ? '✅ Connected' : '❌ Not Connected'}</p>
        {photonUserId && <p>User ID: {photonUserId}</p>}
      </div>

      <div className="flex gap-4">
        <Button onClick={handleGoogleLogin} disabled={isLoading || !!photonToken}>
          Login to Photon
        </Button>

        <Button onClick={handleTokenLaunch} disabled={!photonToken}>
          Track Token Launch
        </Button>

        <Button onClick={handleWalletConnect} disabled={!photonToken}>
          Track Wallet Connect
        </Button>
      </div>
    </div>
  );
}

/**
 * INTEGRATION IN YOUR EXISTING SIGNIN PAGE:
 * 
 * 1. Import the hook:
 *    import { usePhoton } from '@/hooks/usePhoton';
 * 
 * 2. In your component:
 *    const { login: photonLogin, track } = usePhoton();
 * 
 * 3. After successful Google login:
 *    await photonLogin(googleJWT);
 * 
 * 4. After wallet connection:
 *    await track('wallet_connect');
 * 
 * 5. When launching a token:
 *    await track('token_launch', { token_name: 'MyToken' });
 */
