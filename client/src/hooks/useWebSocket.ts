import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { User } from '@shared/schema';

export function useWebSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`wss://${window.location.host}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'auth', userId: user.id }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'balance_update') {
          queryClient.setQueryData(['/api/user'], (oldData: User | null) => {
            if (oldData) {
              return { ...oldData, balance: data.balance };
            }
            return oldData;
          });
        }
      } catch (e) {
        console.error('Failed to parse message or invalid message format.');
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [user, queryClient]);
}
