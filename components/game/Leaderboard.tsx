'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

export default function Leaderboard({ entries, isLoading }: LeaderboardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        🏆 Leaderboard
      </h2>
      
      {isLoading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-400">No players yet</div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 hover:border-yellow-400/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${index === 0 ? 'bg-yellow-500 text-gray-900' : 
                        index === 1 ? 'bg-gray-400 text-gray-900' : 
                        index === 2 ? 'bg-orange-600 text-white' : 
                        'bg-gray-700 text-gray-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{entry.username}</div>
                      <div className="text-xs text-gray-400">
                        {entry.total_hands_played} hands • {entry.win_rate.toFixed(1)}% win rate
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">
                      ${entry.bankroll.toFixed(2)}
                    </div>
                    {entry.biggest_win > 0 && (
                      <div className="text-xs text-yellow-400">
                        Best: ${entry.biggest_win.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
