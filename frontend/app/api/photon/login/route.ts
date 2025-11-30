import { NextRequest, NextResponse } from 'next/server';
import { PHOTON_CONFIG, PHOTON_HEADERS } from '@/lib/photon/config';
import type { PhotonLoginRequest, PhotonLoginResponse } from '@/lib/photon/types';

export async function POST(request: NextRequest) {
  try {
    const { jwt, clientUserId } = await request.json();

    if (!jwt) {
      return NextResponse.json(
        { error: 'JWT token is required' },
        { status: 400 }
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

    const response = await fetch(`${PHOTON_CONFIG.BASE_URL}/identity/register`, {
      method: 'POST',
      headers: PHOTON_HEADERS,
      body: JSON.stringify(photonRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Photon login failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to authenticate with Photon' },
        { status: response.status }
      );
    }

    const data: PhotonLoginResponse = await response.json();

    // Return only the necessary data to the client
    return NextResponse.json({
      accessToken: data.data.tokens.access_token,
      userId: data.data.user.user.id,
      clientUserId: userIdToUse,
      walletAddress: data.data.wallet.walletAddress,
      user: data.data.user.user,
    });

  } catch (error) {
    console.error('Photon login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
