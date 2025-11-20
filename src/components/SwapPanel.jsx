'use client';

import React, { useState, useEffect } from 'react';
import WalletService from '../services/walletService.js';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../config.js';
import { ethers } from 'ethers';

const popularTokens = [
    { address: CONTRACT_ADDRESSES.WBNB, symbol: 'BNB', name: 'BNB' },
    { address: CONTRACT_ADDRESSES.DC48_USDK, symbol: 'DC48USDK', name: 'DC48 USDK' },
    { address: CONTRACT_ADDRESSES.DC48_K, symbol: 'DC48K', name: 'DC48 K' },
    { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD' },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', symbol: 'BUSD', name: 'BUSD' },
];

const SwapPanel = ({ onSuccess }) => {
    const [fromToken, setFromToken] = useState(popularTokens[0]);
    const [toToken, setToToken] = useState(popularTokens[1]);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState(null);
    const [balance, setBalance] = useState('0.0');

    const router = React.useMemo(() => {
        if (!WalletService.provider) return null;
        return new ethers.Contract(
            CONTRACT_ADDRESSES.PANCAKE_ROUTER,
            [
                'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
                'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
                'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
                'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
            ],
            WalletService.signer || WalletService.provider
        );
    }, [WalletService.signer, WalletService.provider]);

    const fetchBalance = async () => {
        if (!WalletService.address || !fromToken || !WalletService.provider) return;

        try {
            let bal;
            if (fromToken.symbol === 'BNB') {
                bal = await WalletService.provider.getBalance(WalletService.address);
            } else {
                const tokenContract = new ethers.Contract(fromToken.address, CONTRACT_ABIS.ERC20, WalletService.provider);
                bal = await tokenContract.balanceOf(WalletService.address);
            }
            setBalance(ethers.utils.formatUnits(bal, 18));
        } catch (e) {
            console.error("Failed to fetch balance:", e);
            setBalance('0.0');
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [fromToken, WalletService.address]);

    const getQuote = async () => {
        if (!fromAmount || parseFloat(fromAmount) <= 0 || !router) return;
        setLoading(true);
        setToAmount('');
        setQuote(null);
        try {
            const amountIn = ethers.utils.parseUnits(fromAmount, 18);
            const path = fromToken.symbol === 'BNB'
                ? [CONTRACT_ADDRESSES.WBNB, toToken.address]
                : toToken.symbol === 'BNB'
                    ? [fromToken.address, CONTRACT_ADDRESSES.WBNB]
                    : [fromToken.address, toToken.address];

            const amounts = await router.getAmountsOut(amountIn, path);
            const output = ethers.utils.formatUnits(amounts[amounts.length - 1], 18);
            setToAmount(parseFloat(output).toFixed(6));
            setQuote(output);
        } catch (e) {
            console.error("Error getting quote:", e);
            setToAmount('');
        }
        setLoading(false);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            getQuote();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [fromAmount, fromToken, toToken]);

    const executeSwap = async () => {
        if (!quote || !WalletService.signer || !router) return;
        setLoading(true);
        try {
            const deadline = Math.floor(Date.now() / 1000) + 1200;
            const amountOutMin = ethers.utils.parseUnits((parseFloat(toAmount) * 0.98).toString(), 18);

            let tx;
            const signerAddress = await WalletService.signer.getAddress();
            const routerWithSigner = router.connect(WalletService.signer);

            if (fromToken.symbol === 'BNB') {
                 tx = await routerWithSigner.swapExactETHForTokens(
                    amountOutMin,
                    [CONTRACT_ADDRESSES.WBNB, toToken.address],
                    signerAddress,
                    deadline,
                    { value: ethers.utils.parseEther(fromAmount) }
                );
            } else {
                 const tokenContract = new ethers.Contract(fromToken.address, CONTRACT_ABIS.ERC20, WalletService.signer);
                 const allowance = await tokenContract.allowance(signerAddress, CONTRACT_ADDRESSES.PANCAKE_ROUTER);
                 const amountIn = ethers.utils.parseUnits(fromAmount, 18);

                 if (allowance.lt(amountIn)) {
                    const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES.PANCAKE_ROUTER, amountIn);
                    await approveTx.wait();
                 }

                 if (toToken.symbol === 'BNB') {
                     tx = await routerWithSigner.swapExactTokensForETH(
                        amountIn,
                        amountOutMin,
                        [fromToken.address, CONTRACT_ADDRESSES.WBNB],
                        signerAddress,
                        deadline
                    );
                 } else {
                     tx = await routerWithSigner.swapExactTokensForTokens(
                        amountIn,
                        amountOutMin,
                        [fromToken.address, toToken.address],
                        signerAddress,
                        deadline
                    );
                 }
            }

            await tx.wait();
            alert('Swap Successful!');
            if (onSuccess) {
                onSuccess();
            }
        } catch (e) {
            console.error('Swap failed:', e);
            alert('Swap failed: ' + (e.reason || e.message));
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-black">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    DC48 DEX — Swap
                </h2>

                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">From</span>
                            <span className="text-sm text-gray-500">Balance: {parseFloat(balance).toFixed(4)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <input
                                type="number"
                                placeholder="0.0"
                                value={fromAmount}
                                onChange={(e) => setFromAmount(e.target.value)}
                                className="text-3xl font-bold bg-transparent outline-none w-full"
                            />
                            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                                {fromToken.symbol}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button onClick={() => {
                            const tempToken = fromToken;
                            setFromToken(toToken);
                            setToToken(tempToken);
                            setFromAmount(toAmount);
                            setToAmount(fromAmount);
                        }} className="bg-gray-200 border-4 border-white rounded-full w-12 h-12 flex items-center justify-center text-xl z-10 -my-12">
                            ↓
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">To (estimated)</span>
                             <span className="text-sm text-gray-500"></span>
                        </div>
                        <div className="flex items-center justify-between">
                            <input
                                type="text"
                                placeholder="0.0"
                                value={toAmount}
                                disabled
                                className="text-3xl font-bold bg-transparent outline-none w-full text-gray-500"
                            />
                            <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold">
                                {toToken.symbol}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={executeSwap}
                        disabled={loading || !quote || !WalletService.signer}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-5 rounded-2xl text-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                        { !WalletService.signer ? 'Connect Wallet' : (loading ? 'Swapping...' : 'Swap on DC48 DEX')}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        Powered by DC48 DEX | 0.17% fee | DC48USDK = Primary Liquidity Pair
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwapPanel;
