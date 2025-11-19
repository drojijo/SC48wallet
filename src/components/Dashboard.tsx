'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WalletService from '../services/walletService';
import { TokenSymbol } from '../config/contracts';

// Import other components
const Header = dynamic(() => import('./Header'), { ssr: false });
const TokenBalances = dynamic(() => import('./TokenBalances'), { ssr: false });
const TransferPanel = dynamic(() => import('./TransferPanel'), { ssr: false });
const GovernancePanel = dynamic(() => import('./GovernancePanel'), { ssr: false });
const StakingPanel = dynamic(() => import('./StakingPanel'), { ssr: false });
const TradingPanel = dynamic(() => import('./TradingPanel'), { ssr: false });

interface WalletState {
  isConnected: boolean;
  address: string;
  isSigner: boolean;
  loading: boolean;
}

interface DashboardProps {
  walletState: WalletState;
  onDisconnect: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ walletState, onDisconnect }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [balances, setBalances] = useState<Record<TokenSymbol, string>>({} as Record<TokenSymbol, string>);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletState.isConnected) {
      loadBalances();
    }
  }, [walletState.address]);

  const loadBalances = async () => {
    setLoading(true);
    try {
      const balanceData = {} as Record<TokenSymbol, string>;
      const tokenKeys: TokenSymbol[] = ['DC48_K', 'DC48_USD', 'DC48_USDK'];

      for (const tokenKey of tokenKeys) {
        try {
          const balance = await WalletService.getTokenBalance(tokenKey);
          balanceData[tokenKey] = balance;
        } catch (error) {
          console.error(`Failed to load balance for ${tokenKey}:`, error);
          balanceData[tokenKey] = '0';
        }
      }

      setBalances(balanceData);
    } catch (error) {
      console.error('Failed to load balances:', error);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'transfer', name: 'Transfer', icon: '🔄' },
    { id: 'governance', name: 'Governance', icon: '🗳️' },
    { id: 'staking', name: 'Staking', icon: '💰' },
    { id: 'trading', name: 'Trading', icon: '📈' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <TokenBalances balances={balances} loading={loading} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('transfer')}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    🔄 Transfer Tokens
                  </button>
                  <button
                    onClick={() => setActiveTab('staking')}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    💰 Stake Tokens
                  </button>
                  <button
                    onClick={() => setActiveTab('trading')}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    📈 Trade Tokens
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Network Info</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Network:</strong> BSC Mainnet</p>
                  <p><strong>Wallet:</strong> DC48 Multi-Sig</p>
                  <p><strong>Status:</strong> {walletState.isSigner ? 'Authorized Signer' : 'User'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'transfer':
        return <TransferPanel onSuccess={loadBalances} />;
      case 'governance':
        return <GovernancePanel />;
      case 'staking':
        return <StakingPanel onSuccess={loadBalances} />;
      case 'trading':
        return <TradingPanel onSuccess={loadBalances} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        walletState={walletState}
        onDisconnect={onDisconnect}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;