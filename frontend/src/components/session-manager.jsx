import { useSessionStore } from '../stores/useSessionStore';
import Button from './ui/button';

export default function SessionManager() {
  const { reset, status } = useSessionStore();

  const endSession = () => {
    reset();
    // Could send leave message via signaling
  };

  if (status === 'idle' || status === 'closed') return null;

  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <p className="text-sm text-gray-600 mb-2">Session active</p>
      <Button variant="outline" size="sm" onClick={endSession}>End Session</Button>
    </div>
  );
}