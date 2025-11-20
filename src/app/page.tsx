'use client';

import React, { useState, useEffect } from 'react';
import SwapPanel from '../components/SwapPanel';
import WalletService from '../services/walletService.js';

const StakingPanel = () => <div className="text-black">Staking functionality is not yet implemented.</div>;
const GovernancePanel = () => <div className="text-black">Governance functionality is not yet implemented.</div>;
const WalletPanel = () => <div className="text-black">Wallet functionality is not yet implemented.</div>;

export default function Home() {
  const [activeTab, setActiveTab] = useState('swap');
  const [isConnected, setIsConnected] = useState(false);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const address = await WalletService.getAddress();
    if (address) {
      setIsConnected(true);
      loadBalances();
    }
  };

  const handleConnect = async () => {
    const address = await WalletService.connectWallet();
    if (address) {
      setIsConnected(true);
      loadBalances();
    }
  };

  const loadBalances = async () => {
    // Placeholder for balance loading logic
    console.log("Reloading balances...");
  };

  const tabs = [
      { id: 'swap', name: 'DEX Swap', icon: '🔥' },
      { id: 'stake', name: 'Staking', icon: '💰' },
      { id: 'govern', name: 'Governance', icon: '🏛️' },
      { id: 'wallet', name: 'Multi-Sig Wallet', icon: '🔒' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'swap':
        return <SwapPanel onSuccess={loadBalances} />;
      case 'stake':
        return <StakingPanel />;
      case 'govern':
        return <GovernancePanel />;
      case 'wallet':
        return <WalletPanel />;
      default:
        return <SwapPanel onSuccess={loadBalances} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full flex-col items-center justify-between py-12 px-4 sm:px-16 bg-white dark:bg-black">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            DC48 DEX — Next Generation DeFi Hub on BNB Chain
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-4">Trade, earn, and govern with institutional-grade security.</p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-left max-w-5xl mx-auto">
            <div className="text-sm font-medium">✓ Ultra-low fees (0.17%)</div>
            <div className="text-sm font-medium">✓ DC48USDK — Fully collateralized</div>
            <div className="text-sm font-medium">✓ Built-in multi-sig wallet</div>
            <div className="text-sm font-medium">✓ Native yield farming</div>
            <div className="text-sm font-medium">✓ Community governance</div>
          </div>

          <div className="mt-8 font-mono text-zinc-500">
            Total Liquidity: $XX.XXM | TVL: $XX.XXM | Users: XX,XXX+
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-4xl mx-auto">
            {isConnected ? (
                <>
                    <div className="flex justify-center border-b border-gray-200 mb-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-lg font-semibold transition-colors ${
                                    activeTab === tab.id
                                    ? 'border-b-2 border-purple-600 text-purple-600'
                                    : 'text-gray-500 hover:text-purple-500'
                                }`}>
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </div>
                    <div>
                        {renderActiveTab()}
                    </div>
                </>
            ) : (
              <div className="text-center">
                <button
                  onClick={handleConnect}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl text-2xl hover:opacity-90 transition-opacity">
                  Connect Wallet to Get Started
                </button>
                <p className="mt-4 text-sm text-gray-500">Connect your MetaMask wallet to begin using the DC48 DEX.</p>
              </div>
            )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center">
        <p className="text-zinc-500">DC48 DEX — Where Security Meets Simplicity | DC48USDK = Your Gateway to Real Yield</p>
        <p className="text-sm text-zinc-600 mt-2">Powered by DC48USDK</p>
      </footer>
    </div>
  );
}

