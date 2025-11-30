import { NextRequest, NextResponse } from 'next/server';
import { PHOTON_CONFIG, PHOTON_HEADERS } from '@/lib/photon/config';
import type { PhotonLoginRequest, PhotonLoginResponse } from '@/lib/photon/types';

export async function POST(request: NextRequest) {
  try {
    const { jwt, clientUserId } = await request.json();

    console.log('🔐 Photon login request received');
    console.log('- Client User ID:', clientUserId);
    console.log('- JWT length:', jwt?.length);
    console.log('- API Key configured:', !!PHOTON_CONFIG.API_KEY);
    console.log('- Campaign ID:', PHOTON_CONFIG.CAMPAIGN_ID);

    if (!jwt) {
      return NextResponse.json(
        { error: 'JWT token is required' },
        { status: 400 }
      );
    }

    if (!PHOTON_CONFIG.API_KEY) {
      console.error('❌ PHOTON_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Photon API key not configured' },
        { status: 500 }
      );
    }

    // Generate unique client user ID if not provided
    const userIdToUse = clientUserId || `user_${Date.now()}`;

    // Call Photon API to exchange Google JWT for Photon token
    const photonRequest: PhotonLoginRequest = {
      provider: 'jwt',
      data: { 
        token: jwt,
        client_user_id: userIdToUse,
      },
    };

    console.log('📡 Calling Photon API:', `${PHOTON_CONFIG.BASE_URL}/identity/register`);
    console.log('📦 Request payload:', JSON.stringify(photonRequest, null, 2));

    const response = await fetch(`${PHOTON_CONFIG.BASE_URL}/identity/register`, {
      method: 'POST',
      headers: PHOTON_HEADERS,
      body: JSON.stringify(photonRequest),
    });

    const responseText = await response.text();
    console.log('✅ Photon API response status:', response.status);
    console.log('📄 Photon API response:', responseText);

    if (!response.ok) {
      console.error('❌ Photon login failed:', responseText);
      return NextResponse.json(
        { error: 'Failed to authenticate with Photon', details: responseText },
        { status: response.status }
      );
    }

    const data: PhotonLoginResponse = JSON.parse(responseText);

    console.log('✅ Photon login successful!');
    console.log('- User ID:', data.data.user.user.id);
    console.log('- Wallet Address:', data.data.wallet.walletAddress);

    // Return only the necessary data to the client
    return NextResponse.json({
      accessToken: data.data.tokens.access_token,
      userId: data.data.user.user.id,
      clientUserId: userIdToUse,
      walletAddress: data.data.wallet.walletAddress,
      user: data.data.user.user,
    });

  } catch (error) {
    console.error('❌ Photon login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
