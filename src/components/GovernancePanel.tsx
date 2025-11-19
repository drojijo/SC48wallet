'use client';

import React, { useState, useEffect } from 'react';
import WalletService from '../services/walletService';
import { ProposalData } from '../config/contracts';

const GovernancePanel: React.FC = () => {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [proposalDescription, setProposalDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const proposalList = await WalletService.getProposals();
      setProposals(proposalList);
    } catch (error: any) {
      setError('Failed to load proposals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalDescription.trim()) {
      setError('Please enter a proposal description');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      setSuccess('');
      await WalletService.createProposal(proposalDescription);
      setSuccess('Proposal created successfully!');
      setProposalDescription('');
      await loadProposals();
    } catch (error: any) {
      setError(error.message || 'Failed to create proposal');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    try {
      setIsVoting(true);
      setError('');
      setSuccess('');
      await WalletService.voteOnProposal(proposalId, support);
      setSuccess(`Vote ${support ? 'in favor of' : 'against'} proposal #${proposalId}`);
      await loadProposals();
    } catch (error: any) {
      setError(error.message || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Governance</h2>

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

      {/* Create Proposal Section */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Create New Proposal</h3>
        <form onSubmit={handleCreateProposal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Description
            </label>
            <textarea
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Describe your proposal..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Proposal'}
          </button>
        </form>
      </div>

      {/* Active Proposals Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Proposals</h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No active proposals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal: any, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                      Proposal #{index}
                    </h4>
                    <p className="text-gray-600 mb-2">{proposal.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Proposer: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                      <span>Votes: {proposal.voteCount}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        proposal.executed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {proposal.executed ? 'Executed' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {!proposal.executed && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleVote(index, true)}
                      disabled={isVoting}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isVoting ? 'Voting...' : 'Vote For'}
                    </button>
                    <button
                      onClick={() => handleVote(index, false)}
                      disabled={isVoting}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isVoting ? 'Voting...' : 'Vote Against'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernancePanel;