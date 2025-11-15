import type { Card } from './types';

// Create a standard 52-card deck
function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      let value: number;
      if (rank === 'A') {
        value = 11; // Ace initially counts as 11
      } else if (['J', 'Q', 'K'].includes(rank)) {
        value = 10;
      } else {
        value = parseInt(rank);
      }
      deck.push({ suit, rank, value });
    }
  }

  return deck;
}

// Fisher-Yates shuffle algorithm
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create and shuffle two decks
export function createTwoDecks(): Card[] {
  const deck1 = createDeck();
  const deck2 = createDeck();
  return shuffleDeck([...deck1, ...deck2]);
}

// Calculate hand value with soft/hard ace logic
export function calculateHandValue(hand: Card[]): { value: number; isSoft: boolean } {
  let value = 0;
  let aces = 0;

  // Count all cards
  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else {
      value += card.value;
    }
  }

  // Adjust aces from 11 to 1 if needed
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  // Check if hand is soft (has an ace counted as 11)
  const isSoft = aces > 0 && value <= 21;

  return { value, isSoft };
}

// Check if hand is blackjack (21 with 2 cards)
export function isBlackjack(hand: Card[]): boolean {
  if (hand.length !== 2) return false;
  const { value } = calculateHandValue(hand);
  return value === 21;
}

// Check if hand is bust
export function isBust(hand: Card[]): boolean {
  const { value } = calculateHandValue(hand);
  return value > 21;
}

// Check if player can double down (first two cards)
export function canDouble(hand: Card[]): boolean {
  return hand.length === 2;
}

// Check if player can split (two cards of same rank)
export function canSplit(hand: Card[], bankroll: number, currentBet: number): boolean {
  if (hand.length !== 2) return false;
  if (bankroll < currentBet) return false; // Not enough money to split
  return hand[0].rank === hand[1].rank;
}

// Check if dealer should hit (hits on 16 or less, stands on soft 17)
export function dealerShouldHit(hand: Card[]): boolean {
  const { value, isSoft } = calculateHandValue(hand);
  
  // Dealer stands on soft 17 or higher
  if (value >= 17) {
    return false;
  }
  
  return true;
}

// Calculate payout for a hand
export function calculatePayout(
  betAmount: number,
  playerValue: number,
  dealerValue: number,
  playerIsBlackjack: boolean,
  playerIsBust: boolean,
  dealerIsBust: boolean
): { result: 'win' | 'loss' | 'push' | 'blackjack'; payout: number } {
  // Player bust always loses
  if (playerIsBust) {
    return { result: 'loss', payout: 0 };
  }

  // Player blackjack pays 3:2 (unless dealer also has blackjack)
  if (playerIsBlackjack) {
    if (dealerValue === 21) {
      return { result: 'push', payout: betAmount }; // Push
    }
    return { result: 'blackjack', payout: betAmount + (betAmount * 1.5) };
  }

  // Dealer bust, player wins
  if (dealerIsBust) {
    return { result: 'win', payout: betAmount * 2 };
  }

  // Compare values
  if (playerValue > dealerValue) {
    return { result: 'win', payout: betAmount * 2 };
  } else if (playerValue < dealerValue) {
    return { result: 'loss', payout: 0 };
  } else {
    return { result: 'push', payout: betAmount };
  }
}

// Calculate insurance payout (pays 2:1 if dealer has blackjack)
export function calculateInsurancePayout(
  insuranceBet: number,
  dealerHasBlackjack: boolean
): number {
  if (dealerHasBlackjack) {
    return insuranceBet * 3; // Original bet + 2:1 payout
  }
  return 0;
}

// Validate bet amount
export function validateBet(betAmount: number, bankroll: number): boolean {
  const MIN_BET = 5;
  
  if (betAmount < MIN_BET) return false;
  if (betAmount > bankroll) return false;
  if (betAmount % 1 !== 0) return false; // Must be whole number
  
  return true;
}

// Deal initial cards (2 to player, 2 to dealer)
export function dealInitialCards(deck: Card[]): {
  playerHand: Card[];
  dealerHand: Card[];
  remainingDeck: Card[];
} {
  const newDeck = [...deck];
  
  const playerHand: Card[] = [
    newDeck.pop()!,
    newDeck.pop()!,
  ];
  
  const dealerHand: Card[] = [
    newDeck.pop()!,
    newDeck.pop()!,
  ];
  
  return {
    playerHand,
    dealerHand,
    remainingDeck: newDeck,
  };
}

// Hit - draw one card
export function drawCard(deck: Card[]): { card: Card; remainingDeck: Card[] } {
  const newDeck = [...deck];
  const card = newDeck.pop()!;
  return { card, remainingDeck: newDeck };
}

// Check if deck needs reshuffling (less than 20 cards left)
export function needsReshuffle(deck: Card[]): boolean {
  return deck.length < 20;
}

// Split hand into two hands
export function splitHand(hand: Card[], deck: Card[]): {
  hand1: Card[];
  hand2: Card[];
  remainingDeck: Card[];
} {
  const newDeck = [...deck];
  const card1 = newDeck.pop()!;
  const card2 = newDeck.pop()!;
  
  return {
    hand1: [hand[0], card1],
    hand2: [hand[1], card2],
    remainingDeck: newDeck,
  };
}

// Check if dealer showing ace (for insurance offer)
export function isDealerShowingAce(dealerHand: Card[]): boolean {
  return dealerHand[0].rank === 'A';
}

// Format currency
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Get chip denominations
export const CHIP_DENOMINATIONS = [
  { value: 5, color: 'red', label: '$5' },
  { value: 25, color: 'green', label: '$25' },
  { value: 100, color: 'black', label: '$100' },
  { value: 500, color: 'purple', label: '$500' },
];
