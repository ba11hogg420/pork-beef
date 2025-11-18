'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAccount, useSignMessage } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

export default function AuthPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const { signMessageAsync } = useSignMessage();
  
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUsernameInput, setShowUsernameInput] = useState(false);

  const handleWalletConnect = async () => {
    if (!isConnected) {
      await open();
      return;
    }

    await handleAuthenticate();
  };

  const handleAuthenticate = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate secure timestamp and nonce for message
      const timestamp = Date.now().toString();
      const nonce = crypto.randomUUID();
      
      // Create message to sign with timestamp and nonce for security
      const message = `Sign this message to authenticate with Blackjack Game.\n\nWallet: ${address}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
      
      // Request signature
      const signature = await signMessageAsync({ message });

      // Send to backend for verification
      const response = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
          timestamp,
          nonce,
          username: username || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.error?.includes('Username')) {
          // New user needs to provide username
          setShowUsernameInput(true);
          setLoading(false);
          return;
        }
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Store session
      localStorage.setItem('blackjack_session', JSON.stringify({
        player: data.player,
        walletAddress: address,
        isNewUser: data.isNewUser,
      }));

      // Redirect to game
      router.push('/game');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-700"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">🃏 Blackjack</h1>
          <p className="text-gray-400">Connect your wallet to play</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4"
          >
            {error}
          </motion.div>
        )}

        {isConnected && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
            <p className="text-green-400 font-mono text-sm break-all">{address}</p>
          </div>
        )}

        {showUsernameInput && isConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4"
          >
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Choose a Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              placeholder="Enter username (3-30 characters)"
            />
            <p className="text-xs text-gray-500 mt-1">This will be your display name on the leaderboard</p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={isConnected ? handleAuthenticate : handleWalletConnect}
          disabled={loading || (showUsernameInput && username.length < 3)}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Authenticating...' : isConnected ? (showUsernameInput ? 'Create Account' : 'Sign Message & Play') : 'Connect Wallet'}
        </motion.button>

        {isConnected && !showUsernameInput && (
          <div className="mt-6 bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded text-sm">
            ℹ️ You'll need to sign a message to verify wallet ownership
          </div>
        )}

        {!isConnected && (
          <div className="mt-6 bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded text-sm">
            💰 New players start with $1,000 bankroll!
          </div>
        )}
      </motion.div>
    </div>
  );
}
