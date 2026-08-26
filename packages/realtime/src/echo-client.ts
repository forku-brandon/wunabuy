import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Assign Pusher globally as required by laravel-echo
if (typeof window !== 'undefined') {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

export interface EchoClientConfig {
  /**
   * Reverb WebSocket App Key.
   */
  broadcasterKey: string;

  /**
   * WebSocket Host Domain (e.g. 'api.wunabuy.com').
   */
  wsHost: string;

  /**
   * WebSocket Port (default: 443 for WSS, 8080 for WS dev).
   */
  wsPort?: number;

  /**
   * Force TLS WSS protocol (default: true).
   */
  forceTLS?: boolean;

  /**
   * Endpoint URL for private channel authentication.
   * Default: 'https://api.wunabuy.com/api/v1/broadcasting/auth'
   */
  authEndpoint?: string;

  /**
   * Async callback to retrieve Bearer token for private channel authorization.
   */
  getToken: () => Promise<string | null>;
}

/**
 * Factory to instantiate a configured Laravel Echo instance connected to Laravel Reverb.
 */
export function createEchoClient(config: EchoClientConfig): Echo {
  return new Echo({
    broadcaster: 'reverb',
    key: config.broadcasterKey,
    wsHost: config.wsHost,
    wsPort: config.wsPort ?? (config.forceTLS !== false ? 443 : 8080),
    wssPort: config.wsPort ?? 443,
    forceTLS: config.forceTLS ?? true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: config.authEndpoint ?? `https://${config.wsHost}/api/v1/broadcasting/auth`,
    authorizer: (channel: { name: string }) => {
      return {
        authorize: async (socketId: string, callback: (error: Error | null, authData: { auth: string } | null) => void) => {
          try {
            const token = await config.getToken();
            const response = await fetch(config.authEndpoint ?? `https://${config.wsHost}/api/v1/broadcasting/auth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            });

            if (!response.ok) {
              throw new Error(`Broadcast auth failed with status ${response.status}`);
            }

            const data = await response.json();
            callback(null, data);
          } catch (err) {
            callback(err as Error, null);
          }
        },
      };
    },
  });
}
