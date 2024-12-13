import { ethers } from "ethers";
import { CharacterType } from "@/lib/definitions";

export const getAllCharacters = async (contract: ethers.Contract): Promise<CharacterType[]> => {
  try {
    const result = await contract.getAllCharacters();
    const characters: CharacterType[] = result.map((character: CharacterType) => ({
      image: character.image,
      creator: character.creator,
      owner: character.owner,
      description: character.description,
      score_c: character.score_c,
      score_t: character.score_t,
      score_a: character.score_a,
      price: (BigInt(character.price) / BigInt(1e18))
    }));
    return characters;
  } catch (error) {
    console.error("Failed to fetch characters: ", error);
    return [];
  }
}
