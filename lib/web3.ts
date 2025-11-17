import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('WalletConnect Project ID is not set. Please add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID to your .env.local');
}

const metadata = {
  name: 'Blackjack Game',
  description: 'Two Deck Blackjack with Web3 Authentication',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://blackjack-game.vercel.app',
  icons: ['🃏']
};

// Create wagmiConfig
export const config = defaultWagmiConfig({
  chains: [mainnet, polygon, arbitrum, base],
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true
});
