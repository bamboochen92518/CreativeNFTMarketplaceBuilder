'use client';
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getCharacterByIndex } from "@/utils";
import CharacterCard from "@/components/character-card";
import { useContract } from "@/context/contract-context";
import { CharacterType } from "@/lib/definitions";
import BidCard from "@/components/bid-card";

const Page = (): React.JSX.Element => {
  const { contract } = useContract();
  const { index } = useParams();
  
  console.log("index:", index);

  const [character, setCharacter] = useState<CharacterType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!contract) {
        setError("Contract is not defined. Please check if you are connected to the wallet.");
        setLoading(false);
        return;
      }

      if (index === undefined) {
        setError("Index is not defined in the URL.");
        setLoading(false);
        return;
      }

      try {
        const characterData = await getCharacterByIndex(contract, Number(index));
        if (characterData) {
          setCharacter(characterData);
          setError(null);
        } else {
          setError("Character is not defined.");
        }
      } catch (err) {
        setError("Failed to fetch character: " + err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [contract, index]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!character) {
    return <div>Character is not defined.</div>;
  }

  return <BidCard character={character} />;
};

export default Page;
