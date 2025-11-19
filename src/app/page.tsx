'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WalletService from '../services/walletService';

// Dynamically import components to avoid SSR issues
const ConnectionPanel = dynamic(() => import('../components/ConnectionPanel'), { ssr: false });
const MetaMaskGuide = dynamic(() => import('../components/MetaMaskGuide'), { ssr: false });
const Dashboard = dynamic(() => import('../components/Dashboard'), { ssr: false });

export default function Home() {
  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: '',
    isSigner: false,
    loading: true
  });
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    checkInitialConnection();
  }, []);

  const checkInitialConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleConnect();
        }
      } catch (error) {
        console.error('Initial connection check failed:', error);
      }
    }
    setWalletState(prev => ({ ...prev, loading: false }));
  };

  const handleConnect = async () => {
    setConnectionError('');
    try {
      const address = await WalletService.connectWallet();
      const isSigner = await WalletService.isUserSigner();

      setWalletState({
        isConnected: true,
        address,
        isSigner,
        loading: false
      });
    } catch (error: any) {
      console.error('Connection failed:', error);
      setConnectionError(error.message || 'Connection failed');
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDisconnect = () => {
    WalletService.disconnect();
    setWalletState({
      isConnected: false,
      address: '',
      isSigner: false,
      loading: false
    });
  };

  if (walletState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DC48 Wallet...</p>
        </div>
      </div>
    );
  }

  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              DC48 Ecosystem
            </h1>
            <p className="text-gray-600">Multi-chain DeFi Platform</p>
          </div>

          {connectionError && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{connectionError}</p>
            </div>
          )}

          <MetaMaskGuide />
          <ConnectionPanel onConnect={handleConnect} isLoading={walletState.loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Dashboard walletState={walletState} onDisconnect={handleDisconnect} />
    </div>
  );
}
