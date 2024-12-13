// Global Variable
let provider, signer, contract, accounts;
let contractAddress, contractABI;

// Fetch Smart Contract and ABI code
fetch('/src/js/contract.json')
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

document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (rect.top >= -rect.height/2 && rect.bottom <= window.innerHeight + rect.height*0.5);
    }

    function handleScroll() {
        sections.forEach((section) => {
            if (isElementInViewport(section)) {
                section.style.opacity = "1";
                section.style.transform = "translateY(0)";
            } else {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
            }
        });
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll);
});
document.getElementById("connectWallet").addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
        try {
            accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accounts.length === 0) {
                throw new Error("No accounts found. Please unlock your wallet.");
            }
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [AVALANCHE_TESTNET_PARAMS]
            })
            const walletAddress = accounts[0];
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log("Successfully Connected", walletAddress);
            loadCharacters();

        } catch (error) {
            console.error("Connected Failed", error);
        }
    } else {
        alert("Do not install MetaMask plugin");
    }
});

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
        const processedImage = await processImage(file, mimeType);
        const tx = await contract.uploadCharacter(accounts[0], processedImage.inlineData.data, {
            value: ethers.parseUnits("0.01", "ether"),
        });
        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
});



async function loadCharacters() {
    const intro = document.getElementById("intro");
    if (intro) intro.style.display = 'none';
    const galleryGrid = document.getElementById("galleryGrid");
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
            price: (BigInt(character.price) / BigInt(1e18))
        }));

        populateCharacterGallery(characters);
    } catch (error) {
        console.error("調用合約失敗:", error);
    }
}

document.getElementById("loadMyCharacters")?.addEventListener("click", async () => {
    loadMyCharacters();
});
async function loadMyCharacters() {
    if (!contract) {
        alert("Please connect your wallet first!");
        return;
    }

    try {
        const result = await contract.getAllCharacters();

        // Filter characters where the owner matches the connected wallet address
        const myCharacters = result
            .map(character => ({
                image: character.image,
                creator: character.creator,
                owner: character.owner,
                description: character.description,
                score_c: character.score_c,
                score_t: character.score_t,
                score_a: character.score_a,
                price: (BigInt(character.price) / BigInt(1e18))
            }))
            .filter(character => character.owner.toLowerCase() === accounts[0].toLowerCase());

        // Display only the user's characters
        populateCharacterGallery(myCharacters);

        if (myCharacters.length === 0) {
            console.log("No characters found for this wallet.");
        }
    } catch (error) {
        console.error("Failed to load your characters:", error);
    }
}


function populateCharacterGallery(characters) {
    const galleryGrid = document.getElementById("galleryGrid");
    galleryGrid.innerHTML = "";
    characters.forEach((character, index) => {
        const characterCard = document.createElement("div");
        characterCard.className = "character-card";
        characterCard.innerHTML = `
            <div class="card-content">
                <div class="card-image">
                    <img src="data:image/png;base64,${character.image}" alt="Character Image">
                </div>
                <div class="card-details">
                    <p><strong>Scores:</strong><br> C: ${character.score_c}, T: ${character.score_t}, A: ${character.score_a}</p>
                    <p><strong>Price:</strong> ${character.price} AVAX</p>
                </div>
            </div>
            <div class="card-actions">
                <!-- <button class="shout-price-btn">Shout Price</button> -->
                <!-- <button class="report-btn">Report</button> -->
                <div class="view-btn">
                    <a href="index.html" style="text-decoration:none">View</a>
                </div>
            </div>
        `;
        characterCard.addEventListener("click", function () {
            window.open("index.html", '_blank').focus();
        });

        galleryGrid.appendChild(characterCard);
    });
}
// loadCharacters();
