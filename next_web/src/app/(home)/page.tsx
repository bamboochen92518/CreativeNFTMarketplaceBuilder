'use client';
import { useContract } from "@/context/contract-context";
import CharacterCard from "@/components/character-card";
import { getAllCharacters } from "@/utils";
import { useState, useEffect } from "react";
import { CharacterType } from "@/lib/definitions";

const Page = (): React.JSX.Element => {
  const { contract } = useContract();
  const [characters, setCharacters] = useState<CharacterType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contract) {
      setError("Contract is not defined.");
      return;
    }

    getAllCharacters(contract)
      .then((characters) => {
        // console.log("Characters fetched:", characters);
        setCharacters(characters);
        setError(null);
      })
      .catch((error) => {
        console.error("Error fetching characters:", error);
        setError("Error occurred when getting characters.");
      });
  }, [contract]);

  if (error) {
    return <>{error}</>;
  }

  return (
    <div className="flex items-start justify-center gap-4">
      {characters.map((character, index) => (
        <CharacterCard key={index} character={character} />
      ))}
    </div>
  );
}

export default Page;
