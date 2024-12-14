// pages/nft-bid.tsx
import { CharacterType } from "@/lib/definitions";
import { ethers } from "ethers";
import Image from "next/image";
import React, { useState } from "react";
import { placeBidCharacter } from '@/utils';
import { useContract } from '@/context/contract-context';
import { Contract } from "ethers";

const BidCard = ({
  character
}: {
  character: CharacterType;
}): React.JSX.Element => {

  const [bid, setBid] = useState<number | string>("");
  const [message, setMessage] = useState<string>("");
  const { contract, accounts } = useContract(); // Access contract and accounts

  const handleBidSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(bid);
    e.preventDefault();
    if (typeof bid === "number" && bid > character.price) {
      try {
        setMessage("Your bid has been successfully placed!");
        await placeBidCharacter(contract, character.index, bid);
      } catch (err) {
        console.log(err);
      }
    } else {
      setMessage("Bid must be higher than the current bid.");
    }
  };

  return (
    <div className="flex items-center justify-center text-white">
      <div className="w-full bg-gradient-to-b from-gray-600 to-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <Image
              src={`data:image/png;base64,${character.image}`}
              alt="Character Image"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
            <p className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-70 px-4 py-2 rounded-lg text-sm font-bold text-green-400">
              Current price: {ethers.formatUnits(character.price, 18)} {"AVAX"}
            </p>
          </div>
          <div className="p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold">NFT name</h1>
              <p className="text-gray-400 mt-2">{character.description}</p>
            </div>
            <form onSubmit={handleBidSubmit} className="mt-6">
              <div>
                <label htmlFor="bid" className="block text-gray-300 font-semibold mb-2">
                  Place Your Bid (ETH):
                </label>
                <input
                  type="number"
                  id="bid"
                  value={bid}
                  onChange={(e) => setBid(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder={`Enter higher than ${character.price} ETH`}
                />
              </div>
              <button
                type="submit"
                className="w-full mt-40 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                Submit Bid
              </button>
            </form>
            {message && (
              <p
                className={`mt-4 text-center ${message.includes("successfully")
                    ? "text-green-400"
                    : "text-red-400"
                  }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidCard;
