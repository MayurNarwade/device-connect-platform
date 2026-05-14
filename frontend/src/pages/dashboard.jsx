import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Paperclip, Wifi, WifiOff, X, Copy, Check } from 'lucide-react';
import webrtcManager from '../services/webrtc-manager';
import { useMessageStore } from '../stores/useMessageStore';
import { useTransferStore } from '../stores/useTransferStore';
import { useSessionStore } from '../stores/useSessionStore';
import TransferProgress from '../components/transfer-progress';

export default function Dashboard() {
  const { role } = useParams();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const fileInputRef = useRef(null);

  const messages = useMessageStore((state) => state.messages ?? []);
  const isWebRTCReady = useSessionStore((state) => state.webrtcReady ?? false);
  const activeTransfers = useTransferStore((state) => state.activeTransfers ?? []);

  useEffect(() => {
    if (!role || (role !== 'host' && role !== 'guest')) {
      navigate('/');
      return;
    }
    webrtcManager.initialize(role);
  }, [role, navigate]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    if (!isWebRTCReady) {
      alert('Connection not ready yet');
      return;
    }
    webrtcManager.sendText(inputText.trim());
    setInputText('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  const handleSendFile = async () => {
    if (!selectedFile) return;
    if (!isWebRTCReady) {
      alert('Connection not ready');
      return;
    }
    webrtcManager.sendFile(selectedFile);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const retryTransfer = (transfer) => {
    if (transfer.file) {
      webrtcManager.sendFile(transfer.file);
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 p-4 glass-card rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold">AetherLink</h1>
            <p className="text-gray-400 text-sm">
              {role === 'host' ? 'Hosting session' : 'Joined session'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isWebRTCReady ? (
              <>
                <Wifi className="text-green-400" size={20} />
                <span className="text-green-400 text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="text-red-400" size={20} />
                <span className="text-red-400 text-sm">Connecting...</span>
              </>
            )}
          </div>
        </div>

        {activeTransfers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Transfers</h2>
            <TransferProgress transfers={activeTransfers} onRetry={retryTransfer} />
          </div>
        )}

        <div className="glass-card rounded-2xl p-4 mb-4 h-[400px] overflow-y-auto flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No messages yet. Start typing below.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.isLocal ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className="relative max-w-[70%]">
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        msg.isLocal
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-700 text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">{formatTime()}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id || idx)}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 shadow-lg"
                      title="Copy message"
                    >
                      {copiedId === (msg.id || idx) ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="glass-card rounded-xl p-3 mb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Paperclip size={16} />
              <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
              <span className="text-xs text-gray-400">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendFile}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-lg text-sm"
              >
                Send
              </button>
              <button
                onClick={() => setSelectedFile(null)}
                className="bg-gray-600 hover:bg-gray-700 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="glass-card p-3 rounded-xl cursor-pointer hover:bg-white/10 transition"
          >
            <Paperclip size={20} />
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendText}
            disabled={!isWebRTCReady || !inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl transition"
          >
            <Send size={20} />
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              webrtcManager.destroy();
              navigate('/');
            }}
            className="text-red-400 hover:text-red-300 text-sm underline"
          >
            Disconnect and leave session
          </button>
        </div>
      </div>
    </motion.div>
  );
}