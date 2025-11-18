import { cookieStorage, createStorage, http } from 'wagmi';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('WalletConnect Project ID is not set. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local');
}

export const metadata = {
  name: 'Blackjack Game',
  description: 'Two Deck Blackjack with Web3 Authentication',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://blackjack-game.vercel.app',
  icons: ['🃏']
};

// Define supported networks
export const networks = [mainnet, polygon, arbitrum, base];

// Create Wagmi adapter (Reown AppKit)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
});

export const config = wagmiAdapter.wagmiConfig;
