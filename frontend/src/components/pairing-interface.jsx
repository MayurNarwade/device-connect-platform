import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createSession, joinSession } from '../services/api';
import { connectSignaling, onSignal, offSignal } from '../services/signaling';
import { useSessionStore } from '../stores/useSessionStore';
import { useUIStore } from '../stores/useUIStore';
import Button from './ui/button';
import Input from './ui/input';

export default function PairingInterface() {
  const navigate = useNavigate();
  const { otp, setSession, setConnected } = useSessionStore();
  const addToast = useUIStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (hasRegistered.current) return;
    hasRegistered.current = true;
    const handler = (data) => {
      setConnected('host', {
        id: data.from || data.payload?.deviceId,
        name: data.payload?.deviceName || 'Partner',
      });
      navigate('/dashboard/host');
    };
    onSignal('device_joined', handler);
    return () => offSignal('device_joined', handler);
  }, [navigate, setConnected]);

  const startHost = async () => {
    setLoading(true);
    setError('');
    try {
      webrtcManager.reset();
      const data = await createSession();
      setSession(data.sessionId, data.otp);
      connectSignaling(data.token, data.sessionId);
    } catch (e) {
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (joinCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      webrtcManager.reset();
      const data = await joinSession(joinCode);
      connectSignaling(data.token, data.sessionId);
      setConnected('guest', { id: data.deviceId, name: 'Partner' });
      navigate('/dashboard/guest');
    } catch (e) {
      setError(e.message);
      addToast('Invalid or expired code', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (otp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 rounded-3xl text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Your Pairing Code</h2>
          <div className="flex gap-2 justify-center my-8">
            {otp.split('').map((d, i) => (
              <motion.div
                key={i}
                className="w-12 h-16 bg-white/50 rounded-xl flex items-center justify-center text-3xl font-bold shadow-inner"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {d}
              </motion.div>
            ))}
          </div>
          <p className="text-gray-500">Waiting for another device to join...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="glass-card p-8 rounded-3xl w-80">
        <h2 className="text-xl font-semibold text-center mb-4">Join a Session</h2>
        <Input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit code"
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
        {error && <p className="text-error text-sm mt-2 text-center">{error}</p>}
        <Button className="w-full mt-4" onClick={handleJoin} disabled={joinCode.length !== 6 || loading}>
          {loading ? 'Joining...' : 'Join'}
        </Button>
      </div>
      <div className="glass-card p-6 rounded-3xl text-center w-80">
        <p className="text-sm text-gray-600">Don't have a code?</p>
        <Button variant="outline" className="w-full mt-2" onClick={startHost} disabled={loading}>
          {loading ? 'Creating...' : 'Create a Session'}
        </Button>
      </div>
    </div>
  );
}