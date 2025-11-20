
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../config';

class WalletService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;

        if (typeof window !== "undefined" && window.ethereum) {
            this.provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        }
    }

    async connectWallet() {
        if (!this.provider) {
            alert("Please install MetaMask!");
            return;
        }

        try {
            await this.provider.send("eth_requestAccounts", []);
            this.signer = this.provider.getSigner();
            this.address = await this.signer.getAddress();

            await this.switchNetwork();

            return this.address;
        } catch (error) {
            console.error("Failed to connect wallet:", error);
            alert("Failed to connect wallet. See console for details.");
        }
    }

    async switchNetwork() {
        if (!this.provider) return;

        try {
            await this.provider.send('wallet_switchEthereumChain', [{ chainId: NETWORK_CONFIG.chainId }]);
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await this.provider.send('wallet_addEthereumChain', [NETWORK_CONFIG]);
                } catch (addError) {
                    console.error("Failed to add network:", addError);
                    alert("Failed to add the BNB Smart Chain network to MetaMask.");
                }
            } else {
                console.error("Failed to switch network:", switchError);
                alert("Failed to switch to the BNB Smart Chain network.");
            }
        }
    }

    disconnectWallet() {
        this.signer = null;
        this.address = null;
        // Note: You can't fully "disconnect" from MetaMask, but you can clear your app's state.
    }

    getProvider() {
        return this.provider;
    }

    getSigner() {
        return this.signer;
    }

    getAddress() {
        return this.address;
    }
}

// Export a singleton instance
const walletServiceInstance = new WalletService();
export default walletServiceInstance;
