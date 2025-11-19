'use client';

import React, { useState, useEffect } from 'react';
import WalletService from '../services/walletService';
import { StakingInfo } from '../config/contracts';

interface StakingPanelProps {
  onSuccess: () => void;
}

const StakingPanel: React.FC<StakingPanelProps> = ({ onSuccess }) => {
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({ stake: '0', rewards: '0' });
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadStakingInfo();
  }, []);

  const loadStakingInfo = async () => {
    try {
      setLoading(true);
      const info = await WalletService.getStakingInfo();
      setStakingInfo(info);
    } catch (error: any) {
      setError('Failed to load staking information: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setStaking(true);
      await WalletService.stakeTokens(amount);
      setSuccess(`Successfully staked ${amount} tokens!`);
      setStakeAmount('');
      await loadStakingInfo();
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Staking failed');
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseFloat(unstakeAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const currentStake = parseFloat(stakingInfo.stake);
    if (amount > currentStake) {
      setError('Cannot unstake more than your current stake');
      return;
    }

    try {
      setUnstaking(true);
      await WalletService.unstakeTokens(amount);
      setSuccess(`Successfully unstaked ${amount} tokens!`);
      setUnstakeAmount('');
      await loadStakingInfo();
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Unstaking failed');
    } finally {
      setUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    setError('');
    setSuccess('');

    const rewardsAmount = parseFloat(stakingInfo.rewards);
    if (rewardsAmount <= 0) {
      setError('No rewards to claim');
      return;
    }

    try {
      setClaiming(true);
      await WalletService.claimStakingRewards();
      setSuccess(`Successfully claimed ${rewardsAmount} in rewards!`);
      await loadStakingInfo();
      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Staking</h2>

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

      {/* Staking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Current Stake</h3>
          <p className="text-3xl font-bold">
            {parseFloat(stakingInfo.stake).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4
            })}
          </p>
          <p className="text-sm opacity-80 mt-2">DC48 K Tokens</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Pending Rewards</h3>
          <p className="text-3xl font-bold">
            {parseFloat(stakingInfo.rewards).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4
            })}
          </p>
          <p className="text-sm opacity-80 mt-2">DC48 K Tokens</p>
        </div>
      </div>

      {/* Staking Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stake Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Stake Tokens</h3>
          <form onSubmit={handleStake} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Stake
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={staking}
              />
            </div>
            <button
              type="submit"
              disabled={staking}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {staking ? 'Staking...' : 'Stake Tokens'}
            </button>
          </form>
        </div>

        {/* Unstake Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Unstake Tokens</h3>
          <form onSubmit={handleUnstake} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Unstake
              </label>
              <input
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                min="0"
                max={stakingInfo.stake}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={unstaking}
              />
            </div>
            <button
              type="submit"
              disabled={unstaking}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {unstaking ? 'Unstaking...' : 'Unstake Tokens'}
            </button>
          </form>
        </div>
      </div>

      {/* Claim Rewards */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Claim Rewards</h3>
            <p className="text-gray-600">
              Claim your accumulated staking rewards. Rewards are calculated based on your staked amount and duration.
            </p>
          </div>
          <button
            onClick={handleClaimRewards}
            disabled={claiming || parseFloat(stakingInfo.rewards) <= 0}
            className="bg-yellow-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? 'Claiming...' : 'Claim Rewards'}
          </button>
        </div>
      </div>

      {/* Staking Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Staking Information</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Earn rewards by staking DC48 K tokens</li>
          <li>• Rewards are distributed continuously based on your stake</li>
          <li>• Unstaking has a 7-day cooldown period</li>
          <li>• APY varies based on total staked amount</li>
        </ul>
      </div>
    </div>
  );
};

export default StakingPanel;