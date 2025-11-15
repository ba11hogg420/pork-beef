import type { GameState } from './types';

const GAME_STATE_KEY = 'blackjack_game_state';

export function saveGameState(gameState: GameState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    if (!saved) return null;
    
    return JSON.parse(saved) as GameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function clearGameState(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

export function saveSoundPreference(muted: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('blackjack_sound_muted', JSON.stringify(muted));
  } catch (error) {
    console.error('Failed to save sound preference:', error);
  }
}

export function loadSoundPreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const saved = localStorage.getItem('blackjack_sound_muted');
    if (!saved) return false;
    
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load sound preference:', error);
    return false;
  }
}
