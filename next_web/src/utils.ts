import { ethers } from "ethers";
import { CharacterType } from "@/lib/definitions";

export const getAllCharacters = async (contract: ethers.Contract): Promise<CharacterType[]> => {
  try {
    const result = await contract.getAllCharacters();
    const characters: CharacterType[] = result.map((character: CharacterType, index: number) => ({
      index: index,
      image: character.image,
      name: character.name,
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

export const getHighestBids = async (contract: ethers.Contract, id: number): Promise<[string, number] | null> => {
  try {
    const [bidders, prices] = await contract.getAllBids(id);
    const highestPrice = Math.max(prices);
    return [bidders[prices.indexOf(highestPrice)], highestPrice];
  } catch (error) {
    console.error("Failed to fetch characters: ", error);
    return null;
  }
}

export const sellCharacter = async (contract: ethers.Contract, id: number, bidder: string): Promise<void> => {
  try {
    const tx = await contract.sellCharacter(id, bidder);
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
  } catch (error) {
    console.error("Failed to place bid to id: ", error);
  }
}

export const placeBidCharacter = async (contract: ethers.Contract, id: number, price: number): Promise<CharacterType | null> => {
  try {
    const tx = await contract.bidCharacter(id, {
      value: BigInt(ethers.formatUnits(price, 'wei')),
    });
    const characters: CharacterType[] = await contract.getAllCharacters(contract);
    if (id < 0 || id >= characters.length) {
      return null;
    }
    //characters[id].price = price;
  } catch (error) {
    console.error("Failed to place bid to id: ", error);
    return null;
  }
}

export const getCharactersByAccount = async (contract: ethers.Contract, account: string): Promise<CharacterType[]> => {
  try {
    const characters: CharacterType[] = await getAllCharacters(contract);
    return characters.filter(character => character.owner.toLowerCase() === account.toLowerCase());
  } catch (error) {
    console.error("Failed to fetch the account's characters: ", error);
    return [];
  }
}

export const getCharacterByIndex = async (contract: ethers.Contract, id: number): Promise<CharacterType | null> => {
  try {
    const characters: CharacterType[] = await getAllCharacters(contract);
    if (id < 0 || id >= characters.length) {
      return null;
    }
    return characters[id];
  } catch (error) {
    console.error("Failed to fetch the character by id: ", error);
    return null;
  }
}

// Define the type for processed image
type ProcessedImageType = {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

/**
 * Upload a character using the contract and selected file.
 * @param contract - ethers.js contract instance.
 * @param account - Wallet address of the user.
 * @param file - The image file selected by the user.
 */
export const createCharacter = async (
  contract: ethers.Contract,
  account: string,
  file: File
): Promise<void> => {
  try {
    // console.log("Processing image file:", file.name);

    // Process the image file
    const mimeType = file.type;
    const processedImage: ProcessedImageType = await processImage(file, mimeType);

    console.log("Processed image: ", processedImage);
    console.log("account: ", account);
    console.log("contract: ", contract);

    // Send the transaction to the smart contract
    const tx = await contract.uploadCharacter(account, processedImage.inlineData.data, {
      value: BigInt(ethers.parseUnits("0.01", "ether")),
    });
    console.log("Transaction sent:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Error uploading character:", error);
    throw error; // Re-throw error for the caller
  }
};

/**
 * Process the uploaded file into Base64-encoded image data.
 * @param file - The image file selected by the user.
 * @param mimeType - The MIME type of the file (e.g., "image/png").
 * @returns ProcessedImage containing Base64 data and MIME type.
 */
async function processImage(file: File, mimeType: string): Promise<ProcessedImageType> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context."));
          return;
        }

        ctx.drawImage(img, 0, 0, 32, 32);

        // Convert canvas content to Base64
        const data = canvas.toDataURL(mimeType).split(",")[1];
        resolve({
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        });
      };
      img.onerror = reject; // Handle image load errors
      img.src = event.target?.result as string;
    };
    reader.onerror = reject; // Handle file read errors
    reader.readAsDataURL(file); // Read file as Base64
  });
}
