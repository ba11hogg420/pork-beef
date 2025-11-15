import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create a unique email for username-based auth
    const email = `${username.toLowerCase()}@blackjack.local`;

    // Check if username already exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('username')
      .eq('username', username)
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create player profile with starting bankroll
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        user_id: authData.user.id,
        username,
        bankroll: 1000, // Starting bankroll
        total_hands_played: 0,
        hands_won: 0,
        hands_lost: 0,
        biggest_win: 0,
      })
      .select()
      .single();

    if (playerError) {
      // If player creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create player profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: authData.user,
      player: playerData,
      session: authData.session,
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
