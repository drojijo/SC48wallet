import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, NETWORK_CONFIG, TokenSymbol, ProposalData, StakingInfo, SwapQuote } from '../config/contracts';

interface TokenContracts {
  DC48K: ethers.Contract;
  DC48USD: ethers.Contract;
  DC48USDK: ethers.Contract;
}

class WalletService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: {
    wallet?: ethers.Contract;
    governance?: ethers.Contract;
    staking?: ethers.Contract;
    trading?: ethers.Contract;
    tokens?: TokenContracts;
  } = {};
  public isConnected = false;

  async connectWallet(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('Please install MetaMask!');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Switch to BSC if needed
      await this.switchToBSC();

      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();

      // Initialize all contracts
      await this.initializeContracts();

      this.isConnected = true;
      const userAddress = await this.signer.getAddress();

      console.log('Connected to:', userAddress);
      return userAddress;

    } catch (error: any) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async switchToBSC(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // If chain not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
        } catch (addError: any) {
          throw new Error('Failed to add BSC network');
        }
      } else {
        throw new Error('Failed to switch to BSC network');
      }
    }
  }

  private async initializeContracts(): Promise<void> {
    if (!this.signer) throw new Error('Signer not initialized');

    // Wallet Contract
    this.contracts.wallet = new ethers.Contract(
      CONTRACT_ADDRESSES.DC48_WALLET,
      CONTRACT_ABIS.WALLET,
      this.signer
    );

    // Governance Contract
    this.contracts.governance = new ethers.Contract(
      CONTRACT_ADDRESSES.DC48_GOVERNANCE,
      CONTRACT_ABIS.GOVERNANCE,
      this.signer
    );

    // Staking Contract
    this.contracts.staking = new ethers.Contract(
      CONTRACT_ADDRESSES.DC48_STAKING,
      CONTRACT_ABIS.STAKING,
      this.signer
    );

    // Trading Contract
    this.contracts.trading = new ethers.Contract(
      CONTRACT_ADDRESSES.DC48_TRADING,
      CONTRACT_ABIS.TRADING,
      this.signer
    );

    // Token Contracts
    this.contracts.tokens = {
      DC48K: new ethers.Contract(CONTRACT_ADDRESSES.DC48_K, CONTRACT_ABIS.ERC20, this.signer),
      DC48USD: new ethers.Contract(CONTRACT_ADDRESSES.DC48_USD, CONTRACT_ABIS.ERC20, this.signer),
      DC48USDK: new ethers.Contract(CONTRACT_ADDRESSES.DC48_USDK, CONTRACT_ABIS.ERC20, this.signer)
    };
  }

  // Token Operations
  async transferToken(tokenName: TokenSymbol, recipient: string, amount: number): Promise<string> {
    if (!this.contracts.wallet || !this.contracts.tokens) {
      throw new Error('Contracts not initialized');
    }

    const tokenAddress = CONTRACT_ADDRESSES[tokenName];
    if (!tokenAddress) throw new Error('Invalid token');

    const encodedData = await this.contracts.wallet.encodeERC20Transfer(
      tokenAddress,
      recipient,
      ethers.utils.parseUnits(amount.toString(), 18)
    );

    const tx = await this.contracts.wallet.submitTransaction(
      encodedData.target,
      encodedData.value,
      encodedData.data
    );

    const receipt = await tx.wait();
    return this.getTransactionIdFromReceipt(receipt);
  }

  async getTokenBalance(tokenName: TokenSymbol): Promise<string> {
    if (!this.signer) throw new Error('Signer not initialized');

    const userAddress = await this.signer.getAddress();

    // Check if it's one of our predefined tokens
    if (this.contracts.tokens && tokenName in this.contracts.tokens) {
      const tokenContract = this.contracts.tokens[tokenName as keyof TokenContracts];
      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.utils.formatUnits(balance, 18);
    }

    // Generic ERC20 for any token
    const tokenAddress = CONTRACT_ADDRESSES[tokenName];
    if (!tokenAddress) throw new Error('Invalid token address');
    if (!this.provider) throw new Error('Provider not initialized');

    const genericContract = new ethers.Contract(
      tokenAddress,
      CONTRACT_ABIS.ERC20,
      this.provider
    );
    const balance = await genericContract.balanceOf(userAddress);
    const decimals = await genericContract.decimals();
    return ethers.utils.formatUnits(balance, decimals);
  }

  async getTokenInfo(tokenAddress: string): Promise<{ name: string; symbol: string; decimals: number }> {
    if (!this.provider) throw new Error('Provider not initialized');

    const tokenContract = new ethers.Contract(tokenAddress, CONTRACT_ABIS.ERC20, this.provider);
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    return { name, symbol, decimals };
  }

  // Governance Operations
  async createProposal(description: string, executionData = '0x'): Promise<ethers.providers.TransactionReceipt> {
    if (!this.contracts.governance) {
      throw new Error('Governance contract not initialized');
    }

    const tx = await this.contracts.governance.propose(description, executionData);
    return await tx.wait();
  }

  async voteOnProposal(proposalId: number, support: boolean): Promise<ethers.providers.TransactionReceipt> {
    if (!this.contracts.governance) {
      throw new Error('Governance contract not initialized');
    }

    const tx = await this.contracts.governance.vote(proposalId, support);
    return await tx.wait();
  }

  async getProposals(): Promise<ProposalData[]> {
    if (!this.contracts.governance) {
      throw new Error('Governance contract not initialized');
    }

    const count = await this.contracts.governance.proposalCount();
    const proposals: ProposalData[] = [];

    for (let i = 0; i < count.toNumber(); i++) {
      const proposal = await this.contracts.governance.getProposal(i);
      proposals.push({
        id: i,
        proposer: proposal.proposer,
        description: proposal.description,
        voteCount: proposal.voteCount.toString(),
        executed: proposal.executed
      } as ProposalData & { id: number });
    }

    return proposals;
  }

  // Staking Operations
  async stakeTokens(amount: number): Promise<ethers.providers.TransactionReceipt> {
    if (!this.contracts.staking) {
      throw new Error('Staking contract not initialized');
    }

    const tx = await this.contracts.staking.stake(
      ethers.utils.parseUnits(amount.toString(), 18)
    );
    return await tx.wait();
  }

  async unstakeTokens(amount: number): Promise<ethers.providers.TransactionReceipt> {
    if (!this.contracts.staking) {
      throw new Error('Staking contract not initialized');
    }

    const tx = await this.contracts.staking.unstake(
      ethers.utils.parseUnits(amount.toString(), 18)
    );
    return await tx.wait();
  }

  async claimStakingRewards(): Promise<ethers.providers.TransactionReceipt> {
    if (!this.contracts.staking) {
      throw new Error('Staking contract not initialized');
    }

    const tx = await this.contracts.staking.claimRewards();
    return await tx.wait();
  }

  async getStakingInfo(): Promise<StakingInfo> {
    if (!this.contracts.staking || !this.signer) {
      throw new Error('Staking contract or signer not initialized');
    }

    const userAddress = await this.signer.getAddress();
    const [stake, rewards] = await Promise.all([
      this.contracts.staking.getStake(userAddress),
      this.contracts.staking.getRewards(userAddress)
    ]);

    return {
      stake: ethers.utils.formatUnits(stake, 18),
      rewards: ethers.utils.formatUnits(rewards, 18)
    };
  }

  // Trading Operations
  async getSwapQuote(amountIn: number, tokenIn: TokenSymbol, tokenOut: TokenSymbol): Promise<string> {
    if (!this.contracts.trading) {
      throw new Error('Trading contract not initialized');
    }

    const path = [CONTRACT_ADDRESSES[tokenIn], CONTRACT_ADDRESSES[tokenOut]];
    const amounts = await this.contracts.trading.getAmountsOut(
      ethers.utils.parseUnits(amountIn.toString(), 18),
      path
    );
    return ethers.utils.formatUnits(amounts[1], 18);
  }

  async swapTokens(
    amountIn: number,
    amountOutMin: number,
    tokenIn: TokenSymbol,
    tokenOut: TokenSymbol
  ): Promise<ethers.providers.TransactionReceipt> {
    if (!this.contracts.trading || !this.signer) {
      throw new Error('Trading contract or signer not initialized');
    }

    const path = [CONTRACT_ADDRESSES[tokenIn], CONTRACT_ADDRESSES[tokenOut]];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

    const tx = await this.contracts.trading.swapExactTokensForTokens(
      ethers.utils.parseUnits(amountIn.toString(), 18),
      ethers.utils.parseUnits(amountOutMin.toString(), 18),
      path,
      await this.signer.getAddress(),
      deadline
    );

    return await tx.wait();
  }

  // Utility Functions
  private getTransactionIdFromReceipt(receipt: ethers.providers.TransactionReceipt): string {
    // In ethers v5, events might be undefined or in a different format
    try {
      if (receipt.logs) {
        for (const log of receipt.logs) {
          // Try to decode the log to find the TransactionSubmitted event
          // This is a simplified approach - in production you'd want to decode the log properly
          if (log.topics && log.topics.length > 0) {
            // For now, return a placeholder. In a real implementation,
            // you'd decode the log to get the transaction ID
            return receipt.transactionHash;
          }
        }
      }
    } catch (error) {
      console.error('Error extracting transaction ID:', error);
    }
    return receipt.transactionHash || '';
  }

  async isUserSigner(): Promise<boolean> {
    if (!this.contracts.wallet || !this.signer) {
      return false;
    }

    try {
      const userAddress = await this.signer.getAddress();
      return await this.contracts.wallet.isSigner(userAddress);
    } catch (error) {
      console.error('Error checking if user is signer:', error);
      return false;
    }
  }

  async getSigners(): Promise<string[]> {
    if (!this.contracts.wallet) {
      throw new Error('Wallet contract not initialized');
    }

    return await this.contracts.wallet.getSigners();
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
  }

  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider;
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }
}

export default new WalletService();