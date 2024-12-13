// pages/nft-display.tsx
import React from "react";

const NFTDisplayPage = (): React.JSX.Element => {
  const nft = {
    image: "https://via.placeholder.com/400", // Replace with the actual image URL
    name: "Exclusive NFT Art",
    description: "A unique piece of digital art for the discerning collector.",
    price: 2.5,
    currency: "ETH",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-lg bg-gray-900 shadow-lg rounded-lg overflow-hidden">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full h-80 object-cover"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-100">{nft.name}</h1>
          <p className="text-gray-400 mt-2">{nft.description}</p>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-semibold text-green-400">
              {nft.price} {nft.currency}
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDisplayPage;
