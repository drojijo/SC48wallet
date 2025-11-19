'use client';

import React from 'react';
import { TokenSymbol, CONTRACT_ADDRESSES } from '../config/contracts';

interface TokenBalancesProps {
  balances: Record<TokenSymbol, string>;
  loading: boolean;
}

const TokenBalances: React.FC<TokenBalancesProps> = ({ balances, loading }) => {
  const tokenConfig = {
    'DC48_K': { name: 'DC48 K', color: 'from-purple-500 to-pink-500' },
    'DC48_USD': { name: 'DC48 USD', color: 'from-green-500 to-blue-500' },
    'DC48_USDK': { name: 'DC48 USDK', color: 'from-orange-500 to-red-500' }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(balances).map(([tokenKey, balance]) => (
        <div
          key={tokenKey}
          className={`bg-gradient-to-r ${tokenConfig[tokenKey as TokenSymbol].color} rounded-xl p-6 text-white shadow-lg`}
        >
          <h3 className="text-lg font-semibold mb-2">
            {tokenConfig[tokenKey as TokenSymbol].name}
          </h3>
          <p className="text-2xl font-bold">
            {parseFloat(balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4
            })}
          </p>
          <p className="text-sm opacity-80 mt-2">
            {CONTRACT_ADDRESSES[tokenKey as TokenSymbol]?.slice(0, 8)}...
          </p>
        </div>
      ))}
    </div>
  );
};

export default TokenBalances;