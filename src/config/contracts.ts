export const CONTRACT_ADDRESSES = {
  DEPLOYER_WALLET: '0x77A8C71Bd15Ed4F0CCfEcE19d9DA53eFfD14aB60',
  DC48_K: '0x7949c33f9c2481FCEc2C2AE25ea39043C8d39CB1',
  DC48_USD: '0xc7F798D372DC1Fd913AE7AD0681540ba88F0834f',
  DC48_GOVERNANCE: '0xeCd691e8537A56d7fE5e78aFb74877c964b4C12b',
  DC48_TRADING: '0xD47dAFf6b62570852e5e34f2A4A1CeC8De59403D',
  DC48_STAKING: '0xf378aba37777ac181d58bcfe2427332c3a8e8a74',
  DC48_WALLET: '0x5daAf1339Fc34525931E4922B9e6379972ab7B85',
  DC48_USDK: '0x1BF9A51f11ca8b3691c60832dae77dcFa0297C23'
} as const;

export const CONTRACT_ABIS = {
  WALLET: [
    "function submitTransaction(address to, uint256 value, bytes data) returns (uint256)",
    "function encodeERC20Transfer(address token, address to, uint256 amount) returns (address target, uint256 value, bytes data)",
    "function getSigners() view returns (address[])",
    "function confirmTransaction(uint256 txId)",
    "function transactionCount() view returns (uint256)",
    "function transactions(uint256) view returns (address to, uint256 value, bytes data, bool executed, uint256 timestamp, uint256 confirmations)",
    "function isSigner(address) view returns (bool)",
    "function dailyLimit() view returns (uint256)",
    "function emergencyStop() view returns (bool)",
    "event TransactionSubmitted(uint256 indexed txId, address indexed proposer, address indexed to, uint256 value, bytes data)"
  ],
  GOVERNANCE: [
    "function propose(string description, bytes executionData) returns (uint256)",
    "function vote(uint256 proposalId, bool support)",
    "function executeProposal(uint256 proposalId)",
    "function getProposal(uint256) view returns (address proposer, string description, uint256 voteCount, bool executed)",
    "function proposalCount() view returns (uint256)"
  ],
  STAKING: [
    "function stake(uint256 amount)",
    "function unstake(uint256 amount)",
    "function claimRewards()",
    "function getStake(address) view returns (uint256)",
    "function getRewards(address) view returns (uint256)"
  ],
  TRADING: [
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
    "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)"
  ],
  ERC20: [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ]
} as const;

export const NETWORK_CONFIG = {
  chainId: '0x38', // BSC Mainnet
  chainName: 'BNB Smart Chain',
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  }
};

export type TokenSymbol = keyof typeof CONTRACT_ADDRESSES;
export type ContractAddress = typeof CONTRACT_ADDRESSES[keyof typeof CONTRACT_ADDRESSES];

export interface TransactionData {
  to: string;
  value: string;
  data: string;
}

export interface ProposalData {
  proposer: string;
  description: string;
  voteCount: string;
  executed: boolean;
}

export interface StakingInfo {
  stake: string;
  rewards: string;
}

export interface SwapQuote {
  amountIn: string;
  amountOut: string;
  path: string[];
}

declare global {
  interface Window {
    ethereum?: any;
  }
}