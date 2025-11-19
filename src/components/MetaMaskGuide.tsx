'use client';

import React from 'react';

const MetaMaskGuide: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">🦊</span>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            MetaMask Required
          </h3>
          <p className="text-yellow-700 mb-4">
            You need MetaMask to interact with the DC48 Ecosystem.
            Download the official mobile app or browser extension.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=io.metamask"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center"
            >
              📱 Android App
            </a>
            <a
              href="https://metamask.io/download.html"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center"
            >
              🖥️ Browser Extension
            </a>
            <a
              href="https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              📱 iOS App
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskGuide;