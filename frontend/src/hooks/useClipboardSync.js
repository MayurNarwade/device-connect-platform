import { useEffect } from 'react';
import { useClipboardStore } from '../stores/useClipboardStore';

export function useClipboardSync(webrtcManager) {
  const enabled = useClipboardStore((s) => s.enabled);

  useEffect(() => {
    if (!enabled || !webrtcManager) return;

    const handler = async () => {
      try {
        const text = await navigator.clipboard.readText();
        webrtcManager.sendClipboard(text);
      } catch (e) {}
    };

    document.addEventListener('copy', handler);
    return () => document.removeEventListener('copy', handler);
  }, [enabled, webrtcManager]);
}