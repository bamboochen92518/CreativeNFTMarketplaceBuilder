import Image from "next/image";
import { CharacterType } from "@/lib/definitions";

const CharacterCard = ({ character }: { character: CharacterType }): React.JSX.Element => {
  return (
    <div
      className="
              flex flex-col justify-between
              backdrop-blur-sm rounded-xl w-96 h-full shadow-xl bg-stone-200 bg-opacity-40 py-8
              hover:bg-white hover:bg-opacity-40
              text-black
            "
    >
      <Image
        src={`data:image/png;base64,${character.image}`}
        alt="Character Image"
        width={500}
        height={500}
      />
      <div className="p-4">
        <p>Creator: {character.creator}</p>
        <p>Owner: {character.owner}</p>
        <p>Description: {character.description}</p>
      </div>
    </div>
  );
};

export default CharacterCard;
