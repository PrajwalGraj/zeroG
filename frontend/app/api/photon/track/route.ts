import { NextRequest, NextResponse } from 'next/server';
import { PHOTON_CONFIG, PHOTON_HEADERS } from '@/lib/photon/config';
import type { PhotonTrackEventRequest, PhotonTrackEventResponse } from '@/lib/photon/types';

export async function POST(request: NextRequest) {
  try {
    const { event_type, client_user_id, metadata } = await request.json();

    console.log('Track request received:', { event_type, client_user_id, metadata });

    if (!event_type || !client_user_id) {
      return NextResponse.json(
        { error: 'event_type and client_user_id are required' },
        { status: 400 }
      );
    }

    // Generate unique event ID and timestamp
    const event_id = `${event_type}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Prepare track event request matching Photon API spec
    const trackRequest: PhotonTrackEventRequest = {
      event_id,
      event_type,
      client_user_id,
      campaign_id: PHOTON_CONFIG.CAMPAIGN_ID,
      metadata: metadata || {},
      timestamp,
    };

    console.log('Sending to Photon API:', {
      url: `${PHOTON_CONFIG.BASE_URL}/attribution/events/campaign`,
      body: trackRequest,
      hasApiKey: !!PHOTON_CONFIG.API_KEY,
      campaignId: PHOTON_CONFIG.CAMPAIGN_ID,
    });

    // Call Photon API to track event
    const response = await fetch(`${PHOTON_CONFIG.BASE_URL}/attribution/events/campaign`, {
      method: 'POST',
      headers: PHOTON_HEADERS,
      body: JSON.stringify(trackRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Photon API responded with error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to track event', details: errorText },
        { status: response.status }
      );
    }

    const result: PhotonTrackEventResponse = await response.json();
    console.log('Photon API success:', result);

    return NextResponse.json({
      success: result.success,
      event_id: result.data.event_id,
      token_amount: result.data.token_amount,
      token_symbol: result.data.token_symbol,
      campaign_id: result.data.campaign_id,
    });

  } catch (error) {
    console.error('Photon track event error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
