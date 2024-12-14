'use client';

import React, { useState } from 'react';
import { useContract } from '@/context/contract-context';
import { ethers } from 'ethers';
import { CharacterType } from '@/lib/definitions';
import Image from 'next/image';

const SellCard = ({ character }: { character: CharacterType }): React.JSX.Element => {
  const { contract, accounts } = useContract();
  const [isConforming, setIsConforming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSellNFT = async () => {
    if (!contract || accounts.length === 0) {
      setFeedback('No connected wallet or contract found.');
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      console.log(`Selling NFT with index: ${character.index}`);
      // IDK how to get bidder address
      // I also DK how to get current height bid so I use character.price
      const bidder = accounts[0];
      const tx = await contract.sellCharacter(character.index, bidder, {
        from: accounts[0],
      });
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      setFeedback('NFT successfully sold!');
    } catch (error) {
      console.error('Error selling NFT:', error);
      setFeedback('Transaction failed. Please try again.');
    } finally {
      setLoading(false); // End loading
      setIsConforming(false); // Close modal
    }
  };

  return (
    <div className="p-8 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Character Details</h1>
      <div className="bg-gradient-to-b from-gray-600 to-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <Image
          src={`data:image/png;base64,${character.image}`}
          alt="Character Image"
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
        <p className="text-xl font-semibold">Index: {character.index}</p>
        <p className="text-lg mt-2">Current Bid: <span className="font-bold text-blue-400">{ethers.formatUnits(character.price, 'ether')} ETH</span></p>
        <button
          onClick={() => setIsConforming(true)}
          className="mt-6 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
        >
          Sell NFT
        </button>
      </div>

      {feedback && (
        <p
          className={`mt-4 text-center text-lg ${feedback.includes('successfully') ? 'text-green-500' : 'text-red-500'
            }`}
        >
          {feedback}
        </p>
      )}

      {/* Confirmation Modal */}
      {isConforming && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-sm">
            <p className="text-lg font-bold mb-4">Confirm Sale</p>
            <p className="mb-6">Are you sure you want to sell this NFT for the current bid of <strong>{ethers.formatUnits(character.price, 'ether')} ETH</strong>?</p>
            <div className="flex justify-between">
              <button
                onClick={() => setIsConforming(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSellNFT}
                disabled={loading}
                className={`py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellCard;
