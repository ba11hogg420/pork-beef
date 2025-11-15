'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import ChipSelector from './ChipSelector';
import type { Card as CardType, GameState, Player } from '@/lib/types';
import {
  createTwoDecks,
  dealInitialCards,
  drawCard,
  calculateHandValue,
  isBlackjack,
  isBust,
  canDouble,
  canSplit,
  dealerShouldHit,
  calculatePayout,
  needsReshuffle,
  splitHand,
  isDealerShowingAce,
  calculateInsurancePayout,
  validateBet,
} from '@/lib/gameLogic';
import { soundManager } from '@/lib/soundManager';
import { saveGameState, loadGameState, clearGameState } from '@/lib/localStorage';
import { supabase } from '@/lib/supabase';

interface BlackjackTableProps {
  player: Player;
  onBankrollUpdate: (newBankroll: number) => void;
}

export default function BlackjackTable({ player, onBankrollUpdate }: BlackjackTableProps) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameState();
    if (saved && saved.playerBankroll === player.bankroll) {
      return saved;
    }
    return {
      deck: createTwoDecks(),
      playerHands: [[]],
      dealerHand: [],
      currentHandIndex: 0,
      bets: [0],
      gamePhase: 'betting',
      playerBankroll: player.bankroll,
      canDouble: [false],
      canSplit: [false],
      handResults: ['playing'],
    };
  });

  const [message, setMessage] = useState('Place your bet!');
  const [showInsuranceOffer, setShowInsuranceOffer] = useState(false);

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState.gamePhase !== 'betting') {
      saveGameState(gameState);
    } else {
      clearGameState();
    }
  }, [gameState]);

  const placeBet = useCallback((betAmount: number) => {
    if (!validateBet(betAmount, gameState.playerBankroll)) {
      setMessage(`Minimum bet is $5. Current bankroll: $${gameState.playerBankroll.toFixed(2)}`);
      return;
    }

    soundManager.play('chipClink');
    setGameState(prev => ({
      ...prev,
      bets: [betAmount],
      gamePhase: 'dealing',
    }));
    setMessage('Dealing cards...');
    
    setTimeout(() => dealCards(betAmount), 500);
  }, [gameState.playerBankroll]);

  const dealCards = useCallback((betAmount: number) => {
    let deck = gameState.deck;
    
    if (needsReshuffle(deck)) {
      deck = createTwoDecks();
      setMessage('Shuffling new decks...');
    }

    const { playerHand, dealerHand, remainingDeck } = dealInitialCards(deck);
    
    // Play card deal sounds
    [0, 1].forEach((i) => {
      setTimeout(() => soundManager.play('cardDeal'), i * 150);
    });

    const newGameState: GameState = {
      ...gameState,
      deck: remainingDeck,
      playerHands: [playerHand],
      dealerHand,
      currentHandIndex: 0,
      bets: [betAmount],
      gamePhase: 'player-turn',
      playerBankroll: gameState.playerBankroll - betAmount,
      canDouble: [canDouble(playerHand)],
      canSplit: [canSplit(playerHand, gameState.playerBankroll - betAmount, betAmount)],
      handResults: ['playing'],
    };

    setGameState(newGameState);

    // Check for immediate blackjack
    if (isBlackjack(playerHand)) {
      setTimeout(() => {
        if (isBlackjack(dealerHand)) {
          finishGame(newGameState, 'push');
        } else {
          finishGame(newGameState, 'blackjack');
        }
      }, 1000);
      return;
    }

    // Offer insurance if dealer shows ace
    if (isDealerShowingAce(dealerHand)) {
      setShowInsuranceOffer(true);
      setMessage('Dealer showing Ace. Insurance?');
    } else {
      setMessage('Your turn! Hit or Stand?');
    }
  }, [gameState]);

  const hit = useCallback(() => {
    const { card, remainingDeck } = drawCard(gameState.deck);
    soundManager.play('cardDeal');

    const newPlayerHands = [...gameState.playerHands];
    newPlayerHands[gameState.currentHandIndex] = [
      ...newPlayerHands[gameState.currentHandIndex],
      card,
    ];

    const newGameState = {
      ...gameState,
      deck: remainingDeck,
      playerHands: newPlayerHands,
      canDouble: gameState.canDouble.map((_, i) => 
        i === gameState.currentHandIndex ? false : gameState.canDouble[i]
      ),
    };

    // Check if bust
    if (isBust(newPlayerHands[gameState.currentHandIndex])) {
      const newHandResults = [...gameState.handResults];
      newHandResults[gameState.currentHandIndex] = 'bust';
      newGameState.handResults = newHandResults;
      
      soundManager.play('loss');
      
      if (gameState.currentHandIndex < gameState.playerHands.length - 1) {
        // Move to next hand
        newGameState.currentHandIndex = gameState.currentHandIndex + 1;
        setMessage(`Hand ${newGameState.currentHandIndex + 1}: Hit or Stand?`);
      } else {
        // All hands played
        setTimeout(() => finishGame(newGameState, 'loss'), 500);
      }
    } else {
      setMessage(`Hand value: ${calculateHandValue(newPlayerHands[gameState.currentHandIndex]).value}`);
    }

    setGameState(newGameState);
  }, [gameState]);

  const stand = useCallback(() => {
    if (gameState.currentHandIndex < gameState.playerHands.length - 1) {
      // Move to next hand
      setGameState(prev => ({
        ...prev,
        currentHandIndex: prev.currentHandIndex + 1,
      }));
      setMessage(`Hand ${gameState.currentHandIndex + 2}: Hit or Stand?`);
      return;
    }

    // All player hands are done, dealer's turn
    setGameState(prev => ({ ...prev, gamePhase: 'dealer-turn' }));
    setMessage("Dealer's turn...");
    
    setTimeout(() => playDealerHand(), 1000);
  }, [gameState]);

  const playDealerHand = useCallback(() => {
    let currentDeck = gameState.deck;
    let currentDealerHand = [...gameState.dealerHand];

    const dealerPlay = () => {
      if (dealerShouldHit(currentDealerHand)) {
        soundManager.play('cardDeal');
        const { card, remainingDeck } = drawCard(currentDeck);
        currentDeck = remainingDeck;
        currentDealerHand = [...currentDealerHand, card];
        
        setGameState(prev => ({
          ...prev,
          deck: currentDeck,
          dealerHand: currentDealerHand,
        }));

        setTimeout(dealerPlay, 1000);
      } else {
        finishGame({
          ...gameState,
          deck: currentDeck,
          dealerHand: currentDealerHand,
        });
      }
    };

    dealerPlay();
  }, [gameState]);

  const finishGame = useCallback(async (finalState: GameState, forcedResult?: string) => {
    const dealerValue = calculateHandValue(finalState.dealerHand).value;
    const dealerBust = isBust(finalState.dealerHand);
    
    let totalPayout = 0;
    const newHandResults = [...finalState.handResults];
    
    for (let i = 0; i < finalState.playerHands.length; i++) {
      if (newHandResults[i] === 'bust') continue;
      
      const playerHand = finalState.playerHands[i];
      const playerValue = calculateHandValue(playerHand).value;
      const playerBlackjack = isBlackjack(playerHand);
      const playerBust = isBust(playerHand);
      
      const { result, payout } = calculatePayout(
        finalState.bets[i],
        playerValue,
        dealerValue,
        playerBlackjack,
        playerBust,
        dealerBust
      );
      
      totalPayout += payout;
      newHandResults[i] = forcedResult || result;
    }

    // Add insurance payout if applicable
    if (finalState.insuranceBet) {
      const insurancePayout = calculateInsurancePayout(
        finalState.insuranceBet,
        isBlackjack(finalState.dealerHand)
      );
      totalPayout += insurancePayout;
    }

    const newBankroll = finalState.playerBankroll + totalPayout;
    const netWin = totalPayout - finalState.bets.reduce((a, b) => a + b, 0);

    // Play sound
    if (netWin > 0) {
      soundManager.play('win');
    } else if (netWin < 0) {
      soundManager.play('loss');
    }

    // Update game state
    setGameState({
      ...finalState,
      gamePhase: 'finished',
      playerBankroll: newBankroll,
      handResults: newHandResults,
    });

    // Update database
    try {
      await supabase
        .from('players')
        .update({
          bankroll: newBankroll,
          total_hands_played: player.total_hands_played + 1,
          hands_won: netWin > 0 ? player.hands_won + 1 : player.hands_won,
          hands_lost: netWin < 0 ? player.hands_lost + 1 : player.hands_lost,
          biggest_win: Math.max(player.biggest_win, netWin),
        })
        .eq('id', player.id);

      onBankrollUpdate(newBankroll);
    } catch (error) {
      console.error('Failed to update player stats:', error);
    }

    // Set result message
    if (netWin > 0) {
      setMessage(`You won $${netWin.toFixed(2)}!`);
    } else if (netWin < 0) {
      setMessage(`You lost $${Math.abs(netWin).toFixed(2)}`);
    } else {
      setMessage('Push - bet returned');
    }
  }, [player, onBankrollUpdate]);

  const double = useCallback(() => {
    const additionalBet = gameState.bets[gameState.currentHandIndex];
    
    if (gameState.playerBankroll < additionalBet) {
      setMessage('Not enough funds to double!');
      return;
    }

    soundManager.play('chipClink');
    
    const newBets = [...gameState.bets];
    newBets[gameState.currentHandIndex] *= 2;
    
    setGameState(prev => ({
      ...prev,
      bets: newBets,
      playerBankroll: prev.playerBankroll - additionalBet,
      canDouble: prev.canDouble.map(() => false),
    }));

    // Hit once and automatically stand
    setTimeout(() => {
      const { card, remainingDeck } = drawCard(gameState.deck);
      soundManager.play('cardDeal');

      const newPlayerHands = [...gameState.playerHands];
      newPlayerHands[gameState.currentHandIndex] = [
        ...newPlayerHands[gameState.currentHandIndex],
        card,
      ];

      setGameState(prev => ({
        ...prev,
        deck: remainingDeck,
        playerHands: newPlayerHands,
      }));

      setTimeout(() => stand(), 500);
    }, 300);
  }, [gameState, stand]);

  const split = useCallback(() => {
    const currentBet = gameState.bets[gameState.currentHandIndex];
    
    if (gameState.playerBankroll < currentBet) {
      setMessage('Not enough funds to split!');
      return;
    }

    soundManager.play('chipClink');
    soundManager.play('cardDeal');

    const { hand1, hand2, remainingDeck } = splitHand(
      gameState.playerHands[gameState.currentHandIndex],
      gameState.deck
    );

    const newPlayerHands = [...gameState.playerHands];
    newPlayerHands[gameState.currentHandIndex] = hand1;
    newPlayerHands.splice(gameState.currentHandIndex + 1, 0, hand2);

    const newBets = [...gameState.bets];
    newBets.splice(gameState.currentHandIndex + 1, 0, currentBet);

    const newHandResults = [...gameState.handResults];
    newHandResults.splice(gameState.currentHandIndex + 1, 0, 'playing');

    setGameState({
      ...gameState,
      deck: remainingDeck,
      playerHands: newPlayerHands,
      bets: newBets,
      playerBankroll: gameState.playerBankroll - currentBet,
      canDouble: [false, false],
      canSplit: [false, false],
      handResults: newHandResults,
    });

    setMessage('Hand split! Play first hand.');
  }, [gameState]);

  const takeInsurance = useCallback(() => {
    const insuranceBet = gameState.bets[0] / 2;
    
    if (gameState.playerBankroll < insuranceBet) {
      setMessage('Not enough funds for insurance!');
      setShowInsuranceOffer(false);
      return;
    }

    soundManager.play('chipClink');
    setGameState(prev => ({
      ...prev,
      insuranceBet,
      playerBankroll: prev.playerBankroll - insuranceBet,
    }));
    setShowInsuranceOffer(false);
    setMessage('Insurance taken. Your turn!');
  }, [gameState]);

  const declineInsurance = useCallback(() => {
    setShowInsuranceOffer(false);
    setMessage('Your turn! Hit or Stand?');
  }, []);

  const newGame = useCallback(() => {
    clearGameState();
    setGameState({
      deck: needsReshuffle(gameState.deck) ? createTwoDecks() : gameState.deck,
      playerHands: [[]],
      dealerHand: [],
      currentHandIndex: 0,
      bets: [0],
      gamePhase: 'betting',
      playerBankroll: gameState.playerBankroll,
      canDouble: [false],
      canSplit: [false],
      handResults: ['playing'],
    });
    setMessage('Place your bet!');
    setShowInsuranceOffer(false);
  }, [gameState]);

  const getHandResult = (index: number) => {
    if (gameState.gamePhase !== 'finished') return null;
    const result = gameState.handResults[index];
    
    const resultStyles = {
      win: 'border-green-500 shadow-green-500/50',
      blackjack: 'border-yellow-400 shadow-yellow-400/50',
      loss: 'border-red-500 shadow-red-500/50',
      bust: 'border-red-500 shadow-red-500/50',
      push: 'border-gray-400 shadow-gray-400/50',
    };

    return resultStyles[result as keyof typeof resultStyles] || '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Dealer's Hand */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-3">Dealer</h3>
        <div className="flex gap-2 flex-wrap">
          {gameState.dealerHand.map((card, index) => (
            <Card
              key={`dealer-${index}`}
              card={card}
              faceDown={index === 1 && gameState.gamePhase === 'player-turn'}
              delay={index * 0.15}
            />
          ))}
        </div>
        {gameState.gamePhase !== 'betting' && gameState.gamePhase !== 'dealing' && (
          <div className="text-white mt-2">
            Value: {gameState.gamePhase === 'player-turn' 
              ? gameState.dealerHand[0].value 
              : calculateHandValue(gameState.dealerHand).value}
          </div>
        )}
      </div>

      {/* Player's Hands */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-3">Your Hand{gameState.playerHands.length > 1 ? 's' : ''}</h3>
        <div className="space-y-4">
          {gameState.playerHands.map((hand, handIndex) => (
            <motion.div
              key={`hand-${handIndex}`}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${handIndex === gameState.currentHandIndex && gameState.gamePhase === 'player-turn'
                  ? 'border-yellow-400 bg-green-900/30'
                  : 'border-gray-600 bg-green-900/20'}
                ${getHandResult(handIndex) ? `${getHandResult(handIndex)} shadow-lg` : ''}
              `}
            >
              <div className="flex gap-2 flex-wrap mb-2">
                {hand.map((card, cardIndex) => (
                  <Card
                    key={`player-${handIndex}-${cardIndex}`}
                    card={card}
                    delay={cardIndex * 0.15}
                  />
                ))}
              </div>
              {hand.length > 0 && (
                <div className="text-white">
                  Bet: ${gameState.bets[handIndex]} | Value: {calculateHandValue(hand).value}
                  {gameState.gamePhase === 'finished' && (
                    <span className="ml-2 font-bold text-yellow-400">
                      {gameState.handResults[handIndex].toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message Display */}
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-2xl font-bold text-yellow-400 mb-6"
      >
        {message}
      </motion.div>

      {/* Insurance Offer */}
      <AnimatePresence>
        {showInsuranceOffer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center gap-4 mb-6"
          >
            <button
              onClick={takeInsurance}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Take Insurance (${(gameState.bets[0] / 2).toFixed(2)})
            </button>
            <button
              onClick={declineInsurance}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
            >
              No Insurance
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Controls */}
      <div className="flex flex-col items-center gap-6">
        {gameState.gamePhase === 'betting' && (
          <ChipSelector
            onSelectBet={placeBet}
            currentBet={gameState.bets[0]}
            bankroll={gameState.playerBankroll}
          />
        )}

        {gameState.gamePhase === 'player-turn' && !showInsuranceOffer && (
          <div className="flex flex-wrap justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={hit}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg"
            >
              Hit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stand}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-lg"
            >
              Stand
            </motion.button>
            {gameState.canDouble[gameState.currentHandIndex] && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={double}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-lg"
              >
                Double Down
              </motion.button>
            )}
            {gameState.canSplit[gameState.currentHandIndex] && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={split}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-lg"
              >
                Split
              </motion.button>
            )}
          </div>
        )}

        {gameState.gamePhase === 'finished' && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={newGame}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xl"
          >
            New Game
          </motion.button>
        )}

        {/* Bankroll Display */}
        <div className="text-center">
          <div className="text-sm text-gray-400">Bankroll</div>
          <div className="text-3xl font-bold text-green-400">
            ${gameState.playerBankroll.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
