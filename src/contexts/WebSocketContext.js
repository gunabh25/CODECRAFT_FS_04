import { createContext, useContext, useEffect, useRef } from 'react';
import { createWebSocket } from '@/utils/websocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children, token }) => {
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = createWebSocket(false); // Set to `true` for mock
    wsRef.current.connect('ws://localhost:3001', token); // Replace with your backend WebSocket URL

    return () => {
      wsRef.current.disconnect();
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={wsRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
