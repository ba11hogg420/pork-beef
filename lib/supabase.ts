import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to get the current user from session
export function getCurrentUserFromSession() {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem('blackjack_session');
  if (!sessionData) return null;
  
  try {
    const session = JSON.parse(sessionData);
    return session;
  } catch {
    return null;
  }
}

// Helper function to get player data by wallet address
export async function getPlayerByWallet(walletAddress: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to get the current user (legacy auth support)
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Helper function to get player data
export async function getPlayerData(userId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to update player bankroll
export async function updatePlayerBankroll(playerId: string, newBankroll: number) {
  const { data, error } = await supabase
    .from('players')
    .update({ bankroll: newBankroll })
    .eq('id', playerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to update player stats
export async function updatePlayerStats(
  playerId: string,
  updates: {
    total_hands_played?: number;
    hands_won?: number;
    hands_lost?: number;
    biggest_win?: number;
  }
) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to add game history entry
export async function addGameHistory(
  playerId: string,
  betAmount: number,
  result: 'win' | 'loss' | 'push' | 'blackjack',
  payout: number,
  bankrollAfter: number
) {
  const { data, error } = await supabase
    .from('game_history')
    .insert({
      player_id: playerId,
      bet_amount: betAmount,
      result,
      payout,
      bankroll_after: bankrollAfter,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to get leaderboard
export async function getLeaderboard(limit: number = 10) {
  const { data, error } = await supabase
    .from('players')
    .select('id, username, bankroll, total_hands_played, hands_won, hands_lost, biggest_win')
    .order('bankroll', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return data.map(player => ({
    ...player,
    win_rate: player.total_hands_played > 0 
      ? (player.hands_won / player.total_hands_played) * 100 
      : 0,
  }));
}
