import { useEffect, useRef } from 'react';
import { WebRTCManager } from '../services/webrtc-manager';
import { useSessionStore } from '../stores/useSessionStore';

export function useWebRTC() {
  const managerRef = useRef(null);
  const role = useSessionStore((s) => s.role);

  useEffect(() => {
    if (!role) return;

    // Only create one manager per role
    if (!managerRef.current) {
      managerRef.current = new WebRTCManager();
      managerRef.current.initialize(role);
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
    };
  }, [role]);

  return managerRef.current;
}