import { ethers } from "ethers";
import { CharacterType } from "@/lib/definitions";

export const getAllCharacters = async (contract: ethers.Contract): Promise<CharacterType[]> => {
  try {
    const result = await contract.getAllCharacters();
    const characters: CharacterType[] = result.map((character: CharacterType, index: number) => ({
      index: index,
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

export const createCharacter = async (
  contract: ethers.Contract,
  account: string,
  file: File
): Promise<void> => {
  try {
    // Process the image
    const mimeType = file.type;
    const processedImage = await processImage(file, mimeType);

    // Send the transaction to the blockchain
    const tx = await contract.uploadCharacter(account, processedImage.inlineData.data, {
      value: ethers.parseUnits("0.01", "ether"), // Payment for the transaction
    });
    console.log("Transaction sent:", tx.hash);

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Character creation failed:", error);
    throw error; // Pass the error up the chain for display
  }
};

/**
 * Processes the image to create a base64 representation.
 * @param file - The uploaded image file.
 * @param mimeType - The MIME type of the file.
 * @returns Base64-encoded image data.
 */
async function processImage(file: File, mimeType: string) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 32; // Resize image to 32x32
        canvas.height = 32;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context."));
          return;
        }

        ctx.drawImage(img, 0, 0, 32, 32);

        // Convert canvas to Base64 data
        const data = canvas.toDataURL(mimeType).split(",")[1];
        resolve({
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        });
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file); // Read the file as Base64
  });
}
