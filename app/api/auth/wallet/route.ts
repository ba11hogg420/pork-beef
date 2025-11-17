import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyMessage } from 'viem';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message, username } = await request.json();

    // Validate input
    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Wallet address, signature, and message are required' },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if player exists
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existingPlayer) {
      // Player exists, return their data
      return NextResponse.json({
        player: existingPlayer,
        isNewUser: false,
      });
    }

    // New player - validate username
    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const { data: usernameCheck } = await supabase
      .from('players')
      .select('username')
      .eq('username', username)
      .single();

    if (usernameCheck) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create auth user with wallet address as email (workaround for Supabase auth)
    const fakeEmail = `${walletAddress.toLowerCase()}@wallet.blackjack`;
    const randomPassword = crypto.randomUUID();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      password: randomPassword,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: 'Failed to create authentication' },
        { status: 500 }
      );
    }

    // Create player profile
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .insert({
        user_id: authData.user.id,
        wallet_address: walletAddress.toLowerCase(),
        username,
        bankroll: 1000,
        total_hands_played: 0,
        hands_won: 0,
        hands_lost: 0,
        biggest_win: 0,
      })
      .select()
      .single();

    if (playerError) {
      // Cleanup on failure
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create player profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      player: playerData,
      isNewUser: true,
    });

  } catch (error) {
    console.error('Wallet auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
