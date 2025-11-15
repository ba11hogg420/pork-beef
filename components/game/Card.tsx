'use client';

import { motion } from 'framer-motion';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
  faceDown?: boolean;
  delay?: number;
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export default function Card({ card, faceDown = false, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotateY: 0 }}
      animate={{ 
        scale: 1, 
        rotateY: faceDown ? 0 : 360,
      }}
      transition={{ 
        duration: 0.3,
        delay,
      }}
      className="relative w-16 h-24 md:w-20 md:h-28 select-none"
    >
      <div className="absolute inset-0 bg-white rounded-lg shadow-lg border-2 border-gray-300 flex flex-col items-center justify-between p-1 md:p-2">
        {faceDown ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 rounded flex items-center justify-center">
            <div className="w-3/4 h-3/4 border-4 border-white/20 rounded-sm"></div>
          </div>
        ) : (
          <>
            <div className={`text-xl md:text-2xl font-bold ${suitColors[card.suit]}`}>
              {card.rank}
            </div>
            <div className={`text-3xl md:text-4xl ${suitColors[card.suit]}`}>
              {suitSymbols[card.suit]}
            </div>
            <div className={`text-xl md:text-2xl font-bold ${suitColors[card.suit]}`}>
              {card.rank}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
