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

export const getCharactersByAccount = async (contract: ethers.Contract, account: string): Promise<CharacterType[]> => {
  try {
    const characters: CharacterType[] = await contract.getAllCharacters(contract);
    return characters.filter(character => character.owner.toLowerCase() === account.toLowerCase());
  } catch (error) {
    console.error("Failed to fetch the account's characters: ", error);
    return [];
  }
}

export const getCharacterByIndex = async (contract: ethers.Contract, id: number): Promise<CharacterType | null> => {
  try {
    const characters: CharacterType[] = await contract.getAllCharacters(contract);
    if (id < 0 || id >= characters.length) {
      return null;
    }
    return characters[id];
  } catch (error) {
    console.error("Failed to fetch the character by id: ", error);
    return null;
  }
}

export const createCharacter = async (contract: ethers.Contract, account: string, file: File): Promise<void> => {
  try {
    const mimeType = file.type;
    const processedImage = await processImage(file, mimeType);
    const tx = await contract.uploadCharacter(account, processedImage.inlineData.data, {
      value: ethers.parseUnits("0.01", "ether"),
    });
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}

async function processImage(file: File, mimeType: string) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 32, 32);

        const data = canvas.toDataURL(mimeType).split(",")[1]; // Base64 encoded data
        resolve({
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        });
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
