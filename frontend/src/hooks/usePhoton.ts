'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { PhotonEventType } from '@/lib/photon/types';

interface PhotonState {
  photonToken: string | null;
  photonUserId: string | null;
  clientUserId: string | null;
  walletAddress: string | null;
  isLoading: boolean;
}

const STORAGE_KEY = 'photon_auth_state';

// Load state from localStorage
const loadState = (): PhotonState => {
  if (typeof window === 'undefined') {
    return {
      photonToken: null,
      photonUserId: null,
      clientUserId: null,
      walletAddress: null,
      isLoading: false,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load Photon state:', error);
  }

  return {
    photonToken: null,
    photonUserId: null,
    clientUserId: null,
    walletAddress: null,
    isLoading: false,
  };
};

// Save state to localStorage
const saveState = (state: PhotonState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save Photon state:', error);
  }
};

export function usePhoton() {
  const [state, setState] = useState<PhotonState>(loadState);
  const { toast } = useToast();

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  /**
   * Login to Photon using Google JWT
   * @param jwt - Google JWT token from authentication
   */
  const login = useCallback(async (jwt: string, clientUserId?: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Generate a unique client user ID if not provided
      const userIdToUse = clientUserId || `user_${Date.now()}`;

      const response = await fetch('/api/photon/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt, clientUserId: userIdToUse }),
      });

      if (!response.ok) {
        throw new Error('Failed to login to Photon');
      }

      const data = await response.json();

      setState({
        photonToken: data.accessToken,
        photonUserId: data.userId,
        clientUserId: userIdToUse,
        walletAddress: data.walletAddress,
        isLoading: false,
      });

      toast({
        title: 'Photon Connected',
        description: `Gamification activated! Wallet: ${data.walletAddress?.substring(0, 8)}...`,
      });

      return { 
        accessToken: data.accessToken, 
        userId: data.userId,
        clientUserId: userIdToUse,
        walletAddress: data.walletAddress,
      };
    } catch (error) {
      console.error('Photon login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Photon Login Failed',
        description: 'Could not connect to rewards system',
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [toast]);

  /**
   * Track an event in Photon (reward user)
   * @param eventType - Type of event to track
   * @param metadata - Optional additional data
   */
  const track = useCallback(async (
    eventType: PhotonEventType,
    metadata?: Record<string, any>
  ) => {
    if (!state.clientUserId) {
      console.warn('Photon not initialized. Tracking skipped.');
      throw new Error('Photon not initialized');
    }

    try {
      const response = await fetch('/api/photon/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          client_user_id: state.clientUserId,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Track API error:', response.status, errorText);
        throw new Error(`Failed to track event: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Show reward info based on token_amount
      const rewardMessage = data.token_amount > 0 
        ? `+${data.token_amount} ${data.token_symbol} earned! 🎉`
        : 'Event logged';

      toast({
        title: 'Event Tracked',
        description: `${eventType}: ${rewardMessage}`,
      });

      return data;
    } catch (error) {
      console.error('Photon track error:', error);
      
      toast({
        title: 'Tracking Failed',
        description: 'Could not record your action',
        variant: 'destructive',
      });
      
      throw error;
    }
  }, [state.clientUserId, toast]);

  /**
   * Logout from Photon (clear state)
   */
  const logout = useCallback(() => {
    setState({
      photonToken: null,
      photonUserId: null,
      clientUserId: null,
      walletAddress: null,
      isLoading: false,
    });
    toast({
      title: 'Photon Disconnected',
      description: 'Signed out successfully',
    });
  }, [toast]);

  return {
    photonToken: state.photonToken,
    photonUserId: state.photonUserId,
    clientUserId: state.clientUserId,
    walletAddress: state.walletAddress,
    isLoading: state.isLoading,
    login,
    track,
    logout,
  };
}
