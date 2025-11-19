'use client';

import React from 'react';

interface WalletState {
  isConnected: boolean;
  address: string;
  isSigner: boolean;
  loading: boolean;
}

interface HeaderProps {
  walletState: WalletState;
  onDisconnect: () => void;
}

const Header: React.FC<HeaderProps> = ({ walletState, onDisconnect }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">DC48</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">DC48 Ecosystem</h1>
              <p className="text-sm text-gray-600">Multi-chain DeFi Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Connected</p>
              <p className="font-medium text-gray-800">
                {formatAddress(walletState.address)}
              </p>
              {walletState.isSigner && (
                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Authorized Signer
                </span>
              )}
            </div>
            <button
              onClick={onDisconnect}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;