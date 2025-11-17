'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BlackjackTable from '@/components/game/BlackjackTable';
import Leaderboard from '@/components/game/Leaderboard';
import type { Player, LeaderboardEntry } from '@/lib/types';
import { soundManager } from '@/lib/soundManager';
import { supabase } from '@/lib/supabase';
import { loadSoundPreference, saveSoundPreference } from '@/lib/localStorage';

export default function GamePage() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check authentication
    const sessionData = localStorage.getItem('blackjack_session');
    
    if (!sessionData) {
      router.push('/auth');
      return;
    }

    try {
      const session = JSON.parse(sessionData);
      setPlayer(session.player);
      
      // Initialize sound
      soundManager.initialize();
      const savedMuted = loadSoundPreference();
      setIsMuted(savedMuted);
      soundManager.setMuted(savedMuted);
      
      if (!savedMuted) {
        soundManager.playAmbience();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load session:', error);
      router.push('/auth');
    }
  }, [router]);

  useEffect(() => {
    // Fetch initial leaderboard
    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard?limit=10');
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleBankrollUpdate = (newBankroll: number) => {
    if (player) {
      const updatedPlayer = { ...player, bankroll: newBankroll };
      setPlayer(updatedPlayer);
      
      // Update session storage
      const sessionData = localStorage.getItem('blackjack_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.player = updatedPlayer;
        localStorage.setItem('blackjack_session', JSON.stringify(session));
      }
    }
  };

  const handleLogout = () => {
    soundManager.stopAmbience();
    localStorage.removeItem('blackjack_session');
    router.push('/login');
  };

  const toggleMute = () => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
    saveSoundPreference(newMuted);
  };

  if (loading || !player) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">🃏 Blackjack</h1>
            <p className="text-sm text-gray-400">Welcome, {player.username}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Table */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-green-900 to-green-950 rounded-lg p-6 border-4 border-yellow-600/50 shadow-2xl">
              <BlackjackTable player={player} onBankrollUpdate={handleBankrollUpdate} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold text-yellow-400 mb-4">📊 Your Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bankroll:</span>
                  <span className="text-green-400 font-bold">${player.bankroll.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hands Played:</span>
                  <span className="font-semibold">{player.total_hands_played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hands Won:</span>
                  <span className="text-green-400 font-semibold">{player.hands_won}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hands Lost:</span>
                  <span className="text-red-400 font-semibold">{player.hands_lost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="font-semibold">
                    {player.total_hands_played > 0
                      ? ((player.hands_won / player.total_hands_played) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Biggest Win:</span>
                  <span className="text-yellow-400 font-bold">${player.biggest_win.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Leaderboard entries={leaderboard} />
            </motion.div>

            {/* Game Rules */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold text-yellow-400 mb-4">📜 Rules</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Two decks in play</li>
                <li>• Dealer stands on soft 17</li>
                <li>• Blackjack pays 3:2</li>
                <li>• Insurance pays 2:1</li>
                <li>• Minimum bet: $5</li>
                <li>• Starting bankroll: $1,000</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
