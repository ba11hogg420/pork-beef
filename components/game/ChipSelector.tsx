'use client';

import { motion } from 'framer-motion';
import { CHIP_DENOMINATIONS } from '@/lib/gameLogic';

interface ChipSelectorProps {
  onSelectBet: (amount: number) => void;
  currentBet: number;
  bankroll: number;
  disabled?: boolean;
}

const chipColors = {
  red: 'bg-gradient-to-br from-red-600 to-red-800 border-red-400',
  green: 'bg-gradient-to-br from-green-600 to-green-800 border-green-400',
  black: 'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-600',
  purple: 'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400',
};

export default function ChipSelector({ onSelectBet, currentBet, bankroll, disabled }: ChipSelectorProps) {
  const handleChipClick = (value: number) => {
    if (disabled) return;
    const newBet = currentBet + value;
    if (newBet <= bankroll) {
      onSelectBet(newBet);
    }
  };

  const handleClearBet = () => {
    if (disabled) return;
    onSelectBet(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {CHIP_DENOMINATIONS.map((chip) => (
          <motion.button
            key={chip.value}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => handleChipClick(chip.value)}
            disabled={disabled || currentBet + chip.value > bankroll}
            className={`
              relative w-14 h-14 md:w-16 md:h-16 rounded-full
              ${chipColors[chip.color as keyof typeof chipColors]}
              border-4 shadow-lg
              flex items-center justify-center
              font-bold text-white text-sm md:text-base
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
          >
            <div className="text-center">
              <div className="text-xs md:text-sm">{chip.label}</div>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
          </motion.button>
        ))}
      </div>
      
      {currentBet > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClearBet}
          disabled={disabled}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Bet
        </motion.button>
      )}
    </div>
  );
}
