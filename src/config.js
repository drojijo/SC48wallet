export const CONTRACT_ADDRESSES = {
    DEPLOYER_WALLET: '0x77A8C71Bd15Ed4F0CCfEcE19d9DA53eFfD14aB60',
    DC48_K: '0x7949c33f9c2481FCEc2C2AE25ea39043C8d39CB1',
    DC48_USD: '0xc7F798D372DC1Fd913AE7AD0681540ba88F0834f',
    DC48_USDK: '0x1BF9A51f11ca8b3691c60832dae77dcFa0297C23',  // MAIN STABLE TOKEN
    DC48_GOVERNANCE: '0xeCd691e8537A56d7fE5e78aFb74877c964b4C12b',
    DC48_TRADING: '0xD47dAFf6b62570852e5e34f2A4A1CeC8De59403D',
    DC48_STAKING: '0xf378aba37777ac181d58bcfe2427332c3a8e8a74',
    DC48_WALLET: '0x5daAf1339Fc34525931E4922B9e6379972ab7B85',

    // PancakeSwap-style Factory & Router
    PANCAKE_FACTORY: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // Official Pancake Factory
    PANCAKE_ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E',   // Official Pancake Router V2
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' // Wrapped BNB
};

export const NETWORK_CONFIG = {
    chainId: '0x38',
    chainName: 'BNB Smart Chain Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
};

export const CONTRACT_ABIS = {
  ERC20: [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function balanceOf(address account) public view returns (uint256)"
  ]
};