'use client';

import React, { useState, useEffect } from 'react';
import WalletService from '../services/walletService';
import { TokenSymbol } from '../config/contracts';

interface TradingPanelProps {
  onSuccess: () => void;
}

const TradingPanel: React.FC<TradingPanelProps> = ({ onSuccess }) => {
  const [tokenIn, setTokenIn] = useState<TokenSymbol>('DC48_K');
  const [tokenOut, setTokenOut] = useState<TokenSymbol>('DC48_USD');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [quote, setQuote] = useState<string>('');
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tokenOptions: { value: TokenSymbol; label: string }[] = [
    { value: 'DC48_K', label: 'DC48 K' },
    { value: 'DC48_USD', label: 'DC48 USD' },
    { value: 'DC48_USDK', label: 'DC48 USDK' }
  ];

  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      getQuote();
    } else {
      setQuote('');
      setAmountOut('');
    }
  }, [amountIn, tokenIn, tokenOut]);

  const getQuote = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) {
      setQuote('');
      setAmountOut('');
      return;
    }

    try {
      setIsLoadingQuote(true);
      setError('');
      const quoteAmount = await WalletService.getSwapQuote(parseFloat(amountIn), tokenIn, tokenOut);
      setQuote(quoteAmount);
      setAmountOut(quoteAmount);
    } catch (error: any) {
      setError('Failed to get quote: ' + error.message);
      setQuote('');
      setAmountOut('');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amountIn || parseFloat(amountIn) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (tokenIn === tokenOut) {
      setError('Cannot swap the same token');
      return;
    }

    const amountInNum = parseFloat(amountIn);
    const amountOutMin = parseFloat(quote || '0') * 0.98; // 2% slippage tolerance

    try {
      setIsSwapping(true);
      await WalletService.swapTokens(amountInNum, amountOutMin, tokenIn, tokenOut);
      setSuccess(`Successfully swapped ${amountIn} ${tokenOptions.find(opt => opt.value === tokenIn)?.label} for ${quote} ${tokenOptions.find(opt => opt.value === tokenOut)?.label}!`);
      setAmountIn('');
      setAmountOut('');
      setQuote('');
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };

  const swapTokens = () => {
    const tempToken = tokenIn;
    const tempAmount = amountIn;
    setTokenIn(tokenOut);
    setTokenOut(tempToken);
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
    setQuote(amountIn);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Trading</h2>

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

      <form onSubmit={handleSwap} className="space-y-6">
        {/* From Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="space-y-2">
            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value as TokenSymbol)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {tokenOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSwapping}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={swapTokens}
            className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
            disabled={isSwapping}
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* To Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="space-y-2">
            <select
              value={tokenOut}
              onChange={(e) => setTokenOut(e.target.value as TokenSymbol)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {tokenOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="text"
                value={isLoadingQuote ? 'Loading quote...' : amountOut}
                placeholder="0.0"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
              {isLoadingQuote && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quote Information */}
        {quote && !isLoadingQuote && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Quote Details</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1 {tokenOptions.find(opt => opt.value === tokenIn)?.label} = {quote} {tokenOptions.find(opt => opt.value === tokenOut)?.label}</p>
              <p>Rate: {(parseFloat(quote) / parseFloat(amountIn || '1')).toFixed(6)}</p>
              <p>Slippage Tolerance: 2%</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSwapping || !amountIn || parseFloat(amountIn) <= 0 || !quote}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSwapping ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Swapping...
            </>
          ) : (
            'Swap Tokens'
          )}
        </button>
      </form>

      {/* Trading Information */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Trading Information</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Token swaps are processed through the DC48 DEX</li>
          <li>• 2% slippage tolerance is applied to all swaps</li>
          <li>• Trading fees are automatically deducted</li>
          <li>• Exchange rates are determined by market liquidity</li>
          <li>• Large trades may experience significant slippage</li>
        </ul>
      </div>
    </div>
  );
};

export default TradingPanel;