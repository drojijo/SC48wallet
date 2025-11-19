'use client';

import React, { useState } from 'react';
import WalletService from '../services/walletService';
import { TokenSymbol } from '../config/contracts';

interface TransferPanelProps {
  onSuccess: () => void;
}

const TransferPanel: React.FC<TransferPanelProps> = ({ onSuccess }) => {
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('DC48_K');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tokenOptions: { value: TokenSymbol; label: string }[] = [
    { value: 'DC48_K', label: 'DC48 K' },
    { value: 'DC48_USD', label: 'DC48 USD' },
    { value: 'DC48_USDK', label: 'DC48 USDK' }
  ];

  const validateAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateAddress(recipient)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      const txId = await WalletService.transferToken(selectedToken, recipient, amountNum);
      setSuccess(`Transfer submitted successfully! Transaction ID: ${txId}`);
      setRecipient('');
      setAmount('');
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Transfer Tokens</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token
          </label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {tokenOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.000001"
            min="0"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Transfer...
            </>
          ) : (
            'Transfer Tokens'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Transfer Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• All transfers are processed through the DC48 multi-sig wallet</li>
          <li>• Transfers require confirmation from authorized signers</li>
          <li>• Daily transfer limits apply for security</li>
          <li>• Transaction fees are paid in BNB</li>
        </ul>
      </div>
    </div>
  );
};

export default TransferPanel;