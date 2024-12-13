import Image from "next/image";
import { CharacterType } from "@/lib/definitions";

const CharacterCard = ({ character }: { character: CharacterType }): React.JSX.Element => {
  return (
    <div className="flex items-center justify-center text-white">
      <div className="max-w-lg bg-gray-600 hover:bg-gray-700 shadow-lg rounded-lg overflow-hidden">
      <Image
        src={`data:image/png;base64,${character.image}`}
        alt="Character Image"
        width={100}
        height={100}
          className="w-full h-80 object-cover"
      />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-100">NFT</h1>
          <p className="text-gray-400 mt-2">{character.description}</p>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-semibold text-green-400">
              {character.price} {"ETH"}
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

export default CharacterCard;
