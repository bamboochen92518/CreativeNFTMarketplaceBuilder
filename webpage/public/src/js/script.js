// Global Variable
let provider, signer, contract, accounts;
let contractAddress, contractABI;

// Fetch Smart Contract and ABI code
fetch('./src/js/contract.json')
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(contractDetail => {
        contractAddress = contractDetail.address;
        contractABI = contractDetail.abi;
    })
    .catch(error => console.error('Error loading JSON:', error));

// Fuji testnet parameters
const AVALANCHE_TESTNET_PARAMS = {
    chainId: '0xA869',
    chainName: 'Avalanche Testnet C-Chain',
    nativeCurrency: {
        name: 'Avalanche',
        symbol: 'AVAX',
        decimals: 18
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/']
}

// Connect to Metamask wallet
document.getElementById("connectWallet").addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

            if (accounts.length === 0) {
                throw new Error("No accounts found. Please unlock your wallet.");
            }

            // Request to switch to the selected Avalanche network
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [AVALANCHE_TESTNET_PARAMS]
            })

            const walletAddress = accounts[0];
            document.getElementById("walletAddress").innerText = walletAddress;

            // Connect to the contract
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);

            console.log("Successfully Connected", walletAddress);

        } catch (error) {
            console.error("Connected Failed", error);
        }
    } else {
        alert("Do not install MetaMask plugin");
    }
});

// Call Read Function in js
document.getElementById("readData").addEventListener("click", async () => {
	if (!contract) {
		alert("請先連接錢包！");
		return;
	}
	try {
		const result = await contract.getAllCharacters();

        const characters = result.map(character => ({
            image: character.image,
            creator: character.creator,
            owner: character.owner,
            description: character.description,
            score_c: character.score_c,
            score_t: character.score_t,
            score_a: character.score_a,
            price: character.price 
        }));

		document.getElementById("contractData").innerText = result;
		console.log("合約返回的資料:", result);
	} catch (error) {
		console.error("調用合約失敗:", error);
	}
});

// Utility function to resize an image to 32x32 and convert to Base64
async function processImage(file, mimeType) {
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


// Send transaction to the contract
document.getElementById("sendTransaction").addEventListener("click", async () => {
    const fileInput = document.getElementById("uploadImage");
    if (!fileInput.files.length) {
        alert("Please select an image!");
        return;
    }

    const file = fileInput.files[0];
    const mimeType = file.type;

    if (!contract) {
        alert("Please connect your wallet first!");
        return;
    }

    try {
        // Process the image
        const processedImage = await processImage(file, mimeType);

        // Call the contract's function with msg.sender and processed image data
        const tx = await contract.uploadCharacter(accounts[0], processedImage.inlineData.data, {
            value: ethers.parseUnits("0.01", "ether"),
        });

        console.log("Transaction sent:", tx.hash);

        // Wait for transaction confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
});
