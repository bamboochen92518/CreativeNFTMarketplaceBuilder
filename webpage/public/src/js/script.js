// 合約地址與 ABI
const contractAddress = "0xfCeAF2ADb16d24428A952087fc216085bF06C7E7";
const contractABI = [
    {
        "inputs": [
            {   
                "internalType": "address",
                "name": "creator", 
                "type": "address" 
            },
            {   
                "internalType": "string",
                "name": "image", 
                "type": "string" 
            }
        ],
        "name": "uploadCharacter",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "NFTID",
                "type": "uint256"
            }
        ],
        "name": "regradeCharacter",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }, 
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "NFTID",
                "type": "uint256"
            }
        ],
        "name": "bidCharacter",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "NFTID",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "bidder",
                "type": "address"
            }
        ],
        "name": "sellCharacter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "NFTID",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "reason",
                "type": "string"
            }
        ],
        "name": "reportCharacter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllCharacters",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "creator",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "score_c",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "score_t",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "score_a",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "price",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Character[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// 全局變數
let provider, signer, contract;

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

// 1. 連接 MetaMask 錢包
document.getElementById("connectWallet").addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

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
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            console.log("MetaMask 已連接:", walletAddress);

        } catch (error) {
            console.error("錢包連接失敗:", error);
        }
    } else {
        alert("請安裝 MetaMask 擴充套件！");
    }
});

// Call Read Function in js
document.getElementById("readData").addEventListener("click", async () => {
	if (!contract) {
		alert("請先連接錢包！");
		return;
	}
	try {
		// 調用合約的只讀方法
		const result = await contract.getAllCharacters();
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


// 3. 發送交易到智能合約
document.getElementById("sendTransaction").addEventListener("click", async () => {
	if (!contract) {
		alert("請先連接錢包！");
		return;
	}
	try {
		// 發送交易到合約
		const tx = await contract.yourWriteFunctionName(arg1, arg2); // 替換方法名稱與參數
		document.getElementById("transactionHash").innerText = tx.hash;
		console.log("交易已發送:", tx.hash);

		// 等待交易確認
		const receipt = await tx.wait();
		console.log("交易已確認:", receipt);
	} catch (error) {
		console.error("交易失敗:", error);
	}
});

