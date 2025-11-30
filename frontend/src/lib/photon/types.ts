// Photon API type definitions

export interface PhotonLoginRequest {
  provider: string;
  data: {
    token: string;
    client_user_id: string;
  };
}

export interface PhotonLoginResponse {
  success: boolean;
  data: {
    user: {
      user: {
        id: string;
        name: string;
        avatar: string;
      };
      user_identities: Array<{
        id: string;
        user_id: string;
        provider: string;
        provider_id: string;
      }>;
    };
    tokens: {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };
    wallet: {
      photonUserId: string;
      walletAddress: string;
    };
  };
}

export interface PhotonTrackEventRequest {
  event_id: string;
  event_type: string;
  client_user_id: string;
  campaign_id: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface PhotonTrackEventResponse {
  success: boolean;
  data: {
    success: boolean;
    event_id: string;
    token_amount: number;
    token_symbol: string;
    campaign_id: string;
  };
}

export type PhotonEventType = 
  | 'token_launch'
  | 'wallet_connect'
  | 'vault_deposit'
  | 'swap_complete'
  | 'staking_start'
  | 'game_win'
  | 'daily_login';
