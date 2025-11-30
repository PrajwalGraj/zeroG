'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { PhotonEventType } from '@/lib/photon/types';

interface PhotonState {
  photonToken: string | null;
  photonUserId: string | null;
  isLoading: boolean;
}

export function usePhoton() {
  const [state, setState] = useState<PhotonState>({
    photonToken: null,
    photonUserId: null,
    isLoading: false,
  });
  const { toast } = useToast();

  /**
   * Login to Photon using Google JWT
   * @param jwt - Google JWT token from authentication
   */
  const login = useCallback(async (jwt: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/photon/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt }),
      });

      if (!response.ok) {
        throw new Error('Failed to login to Photon');
      }

      const data = await response.json();

      setState({
        photonToken: data.accessToken,
        photonUserId: data.userId,
        isLoading: false,
      });

      toast({
        title: 'Photon Connected',
        description: 'Gamification rewards activated!',
      });

      return { accessToken: data.accessToken, userId: data.userId };
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
    if (!state.photonToken || !state.photonUserId) {
      console.error('Photon not initialized. Call login() first.');
      toast({
        title: 'Photon Not Ready',
        description: 'Please connect your account first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/photon/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          user_id: state.photonUserId,
          auth_token: state.photonToken,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track event');
      }

      const data = await response.json();

      toast({
        title: 'Reward Earned! 🎉',
        description: `You've been rewarded for ${eventType}`,
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
  }, [state.photonToken, state.photonUserId, toast]);

  /**
   * Logout from Photon (clear state)
   */
  const logout = useCallback(() => {
    setState({
      photonToken: null,
      photonUserId: null,
      isLoading: false,
    });
  }, []);

  return {
    photonToken: state.photonToken,
    photonUserId: state.photonUserId,
    isLoading: state.isLoading,
    login,
    track,
    logout,
  };
}
