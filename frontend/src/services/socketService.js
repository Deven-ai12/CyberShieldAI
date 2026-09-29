const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ||
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/^http/, 'ws');

export function createThreatSocket({ onMessage, onOpen, onClose, onError } = {}) {
  let socket;

  return {
    connect(path = '/ws/threats') {
      socket = new WebSocket(`${WS_BASE_URL}${path}`);
      socket.onopen = onOpen || null;
      socket.onclose = onClose || null;
      socket.onerror = onError || null;
      socket.onmessage = (event) => {
        try {
          onMessage?.(JSON.parse(event.data));
        } catch {
          onMessage?.({ raw: event.data });
        }
      };
      return socket;
    },
    send(payload) {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    },
    close() {
      socket?.close();
    },
  };
}
