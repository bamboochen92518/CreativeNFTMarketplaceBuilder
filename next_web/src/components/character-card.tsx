import Image from "next/image";
import { CharacterType } from "@/lib/definitions";

const CharacterCard = ({ character }: { character: CharacterType }): React.JSX.Element => {
  return (
    <div
      className="
              flex flex-col justify-between
              backdrop-blur-sm rounded-xl w-96 h-full shadow-xl bg-slate-900 outline outline-4 outline-slate-100
              overflow-hidden
              hover:outline-slate-500
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
