import { useEffect, useRef } from 'react';
import { useSessionStore } from '../stores/useSessionStore';

export function useConnectionQuality(peerConnection) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!peerConnection) return;
    const check = async () => {
      try {
        const stats = await peerConnection.getStats();
        let rtt = null;
        let throughput = 0;
        stats.forEach((report) => {
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime ? Math.round(report.currentRoundTripTime * 1000) : null;
            throughput = report.totalBytesReceived || 0; // rough
          }
        });
        useSessionStore.getState().updateQuality(rtt, throughput);
      } catch (e) {}
    };
    intervalRef.current = setInterval(check, 2000);
    return () => clearInterval(intervalRef.current);
  }, [peerConnection]);
}