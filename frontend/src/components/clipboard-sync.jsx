import { useClipboardStore } from '../stores/useClipboardStore';
import Toggle from './ui/toggle';
import { useWebRTC } from '../hooks/useWebRTC';

export default function ClipboardSync() {
  const { enabled, toggle, lastSync } = useClipboardStore();
  const manager = useWebRTC();

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Clipboard Sync</h3>
        <Toggle enabled={enabled} onChange={toggle} />
      </div>
      {lastSync && (
        <p className="text-xs text-gray-500 truncate">Last: {lastSync.slice(0, 50)}…</p>
      )}
    </div>
  );
}