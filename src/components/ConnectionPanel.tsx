'use client';

import React from 'react';

interface ConnectionPanelProps {
  onConnect: () => Promise<void>;
  isLoading?: boolean;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({ onConnect, isLoading = false }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Connect your MetaMask wallet to access the DC48 Ecosystem
        </p>

        <button
          onClick={onConnect}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            'Connect MetaMask'
          )}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          By connecting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default ConnectionPanel;