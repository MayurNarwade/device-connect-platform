import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Globe, Lock, Users, Server, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
            AetherLink
          </h1>
          <p className="text-xl text-gray-300 mt-4 max-w-2xl mx-auto">
            Secure, real‑time file sharing & messaging.<br />
            Peer‑to‑peer. No cloud. No signup.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/pair"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-semibold transition flex items-center gap-2"
            >
              Start a Session <ArrowRight size={18} />
            </Link>
            <Link
              to="/pair"
              className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-full font-semibold transition border border-gray-700"
            >
              Join a Session
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-2xl text-center backdrop-blur-sm bg-white/5 border border-white/10"
            >
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="glass-card rounded-3xl p-10 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to share?</h2>
          <p className="text-gray-300 mb-6">
            Create a session, share the 6-digit code, and start transferring files instantly.
          </p>
          <Link
            to="/pair"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-full font-semibold transition inline-block"
          >
            Get Started – It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        AetherLink – End-to-end encrypted • No data storage • Open source
      </footer>
    </div>
  );
}

const features = [
  { icon: <Zap size={28} />, title: 'Lightning Fast', desc: 'Direct peer-to-peer connection for minimal latency.' },
  { icon: <Lock size={28} />, title: 'End-to-End Encrypted', desc: 'Your files never touch any server.' },
  { icon: <Users size={28} />, title: 'No Signup', desc: 'Create or join a session with a simple 6-digit code.' },
  { icon: <Globe size={28} />, title: 'Works Anywhere', desc: 'STUN ensures connectivity even behind firewalls.' },
  { icon: <Shield size={28} />, title: 'Private & Secure', desc: 'WebRTC data channels are encrypted by default.' },
  { icon: <Server size={28} />, title: 'No Cloud Storage', desc: 'Files transfer directly between devices.' },
];