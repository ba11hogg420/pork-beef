'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const sessionData = localStorage.getItem('blackjack_session');
    if (sessionData) {
      router.push('/game');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-yellow-400 mb-4">
            🃏 Blackjack
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Professional Two-Deck Blackjack
          </p>
          <p className="text-gray-400">
            Play, compete, and climb the leaderboard!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-xl py-6 rounded-lg shadow-lg"
          >
            Login
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/register')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-6 rounded-lg shadow-lg"
          >
            Register
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">$1,000 Start</h3>
            <p className="text-sm text-gray-400">
              Begin with a generous bankroll and build your fortune
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Real-time Leaderboard</h3>
            <p className="text-sm text-gray-400">
              Compete with other players and climb to the top
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="text-lg font-bold text-yellow-400 mb-2">Full Features</h3>
            <p className="text-sm text-gray-400">
              Split, double down, insurance, and more!
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>Professional blackjack with authentic casino rules</p>
          <p className="mt-2">Two decks • Dealer stands soft 17 • 3:2 blackjack payout</p>
        </motion.div>
      </div>
    </div>
  );
}
