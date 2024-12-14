// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import openzeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// Import ChainLink
import {FunctionsClient} from "@chainlink/contracts/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

// Import Test
import {Test, console2} from "forge-std/Test.sol";

contract CharacterNFT is ERC721Enumerable, FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // About NFT
    struct Character {
        string image;
        address creator;
        address owner;
        string description;
        uint256 score_c; // Creativity
        uint256 score_t; // Technique
        uint256 score_a; // Aesthetics
        uint256 price;   // Default: score_c + score_t + score_a
    }

    uint256 public characterCounter;
    uint256 public UPLOAD_FEE = 0.1 ether;
    uint256 public REGRADE_FEE = 0.05 ether;
    uint256 public REGRADE_TIME = 3;
    uint256 public MAX_SCORE = 5;

    mapping(uint256 => Character) public characters;                // NFT ID to Character
    mapping(uint256 => uint256) public leftRegradeTimes;            // NFT ID to regrading opportunities
    mapping(uint256 => address[]) public bidders;                   // NFT ID to list of bidders
    mapping(uint256 => mapping(address => uint256)) public bids;    // NFT ID to (bidder -> bid amount)
    mapping(uint256 => mapping(address => string)) public reports;  // NFT ID to (reporter -> reason)

    // About ChainLink
    mapping(bytes32 => uint256) public requestIdtoNFT;              // requestId to NFT ID

    // Check to get the router address for your supported network https://docs.chain.link/chainlink-functions/supported-networks
    address router = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;

    constructor() ERC721("CharacterNFT", "CNFT") FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    // Users can upload their self-created character by sending sufficient native tokens
    function uploadCharacter(address creator, string memory image) external payable {
        require(msg.value >= UPLOAD_FEE, "Not enough ether sent"); // Ensure sufficient ether is sent

        uint256 newCharacterId = characterCounter++;
        _safeMint(creator, newCharacterId);

        characters[newCharacterId] = Character({
            image: image,
            creator: creator,
            owner: creator,
            description: "Grading ...",
            score_c: 0,
            score_t: 0,
            score_a: 0,
            price: 0.1 ether
        });

        gradeCharacter(image, newCharacterId);

        leftRegradeTimes[newCharacterId] = REGRADE_TIME;
    }

    // Grades a character based on the image
    function gradeCharacter(string memory image, uint256 NFTID) internal {
        string[] memory args = new string[](1);
        args[0] = image;
        bytes32 requestId = sendRequest(14340, args);
        requestIdtoNFT[requestId] = NFTID;
    }

    // Allows the owner of an NFT to request a regrade
    function regradeCharacter(uint256 NFTID) external payable {
        require(msg.value >= REGRADE_FEE, "Not enough ether sent");
        require(msg.sender == characters[NFTID].owner, "Only the owner can request a regrade");
        require(leftRegradeTimes[NFTID] > 0, "No more regrade attempts available");

        leftRegradeTimes[NFTID]--;
        gradeCharacter(characters[NFTID].image, NFTID);
    }

    // Allows users to bid for a character by sending native tokens
    function bidCharacter(uint256 NFTID) external payable {
        require(msg.value > 0, "Bid amount must be greater than zero");

        if (bids[NFTID][msg.sender] == 0) {
            bidders[NFTID].push(msg.sender); // Add new bidder
        }
        bids[NFTID][msg.sender] += msg.value; // Update bid amount
    }

    // Allows the owner to sell the NFT to a bidder
    function sellCharacter(uint256 NFTID, address bidder) external {
        require(msg.sender == characters[NFTID].owner, "Only the owner can sell this NFT");
        uint256 bidAmount = bids[NFTID][bidder];
        require(bidAmount > 0, "Bidder has not placed a valid bid");

        // Transfer NFT ownership
        _transfer(msg.sender, bidder, NFTID);
        characters[NFTID].owner = bidder;

        // Transfer the bid amount to the owner
        (bool sent, ) = payable(msg.sender).call{value: bidAmount}("");
        require(sent, "Failed to transfer funds to the seller");

        // Refund other bidders
        address[] memory allBidders = bidders[NFTID];
        for (uint256 i = 0; i < allBidders.length; i++) {
            address otherBidder = allBidders[i];
            if (otherBidder != bidder) {
                uint256 refundAmount = bids[NFTID][otherBidder];
                if (refundAmount > 0) {
                    (bool refunded, ) = payable(otherBidder).call{value: refundAmount}("");
                    require(refunded, "Failed to refund other bidders");
                }
            }
            // Clear all bid data
            bids[NFTID][otherBidder] = 0;
        }
        delete bidders[NFTID]; // Clear bidder list
    }

    // Reports a character for a specific reason
    function reportCharacter(uint256 NFTID, string memory reason) external {
        reports[NFTID][msg.sender] = reason;
    }

    // Retrieves all characters
    function getAllCharacters() external view returns (Character[] memory) {
        uint256 totalCharacters = characterCounter;
        Character[] memory result = new Character[](totalCharacters);

        for (uint256 i = 0; i < totalCharacters; i++) {
            result[i] = characters[i];
        }

        return result;
    }
    
    // Retrieves all bid
    function getAllBids(uint256 NFTID) external view returns (address[] memory, uint256[] memory) {
        uint256 count = bidders[NFTID].length;
        address[] memory addresses = new address[](count);
        uint256[] memory amounts = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            addresses[i] = bidders[NFTID][i];
            amounts[i] = bids[NFTID][bidders[NFTID][i]];
        }

        return (addresses, amounts);
    }

    // ChainLink function
    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    // Event to log responses
    event Response(
        bytes32 indexed requestId,
        string character,
        bytes response,
        bytes err
    );

    // JavaScript source code
    string source = "const prompt = \"Please generate a 15-20 word description of this character (do not mention boxy, pixelated), and rank it from 1 to 5 respectively for Creativity, Technique, and Aesthetics. The output should be in JSON format, like: {\"Description\": str, \"Creativity\": int, \"Technique\": int, \"Aesthetics\": int}.\";"
        "const image = args[0];"
        "const geminiRequest = Functions.makeHttpRequest({"
        "    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${secrets.googleApiKey}`,"
        "    method: \"POST\","
        "    headers: {\"Content-Type\": \"application/json\"},"
        "    data: {\"contents\": [{\"parts\": [{\"text\": prompt}, {\"inline_data\": {\"mime_type\": \"image/jpg\", \"data\": image}}]}]},"
        "    timeout: 100000"
        "});"
        "const [geminiResponse] = await Promise.all([geminiRequest]);"
        "const result = geminiResponse.data.candidates[0].content.parts[0].text;"
        "return Functions.encodeString(result);";

    //Callback gas limit
    uint32 gasLimit = 300_000;

    // donID - Hardcoded for Sepolia
    // Check to get the donID for your supported network https://docs.chain.link/chainlink-functions/supported-networks
    bytes32 donID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;

    /**
     * @notice Sends an HTTP request for character information
     * @param subscriptionId The ID for the Chainlink subscription
     * @param args The arguments to pass to the HTTP request
     * @return requestId The ID of the request
     */
    function sendRequest(uint64 subscriptionId, string[] memory args) internal returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        if (args.length > 0) req.setArgs(args);
        s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);
        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        s_lastError = err;

        // Update NFT
        string memory description = string(response);
        uint256 score_c = 1;
        uint256 score_t = 2;
        uint256 score_a = 3;
        uint256 price = (score_c + score_t + score_a) * 1 ether;

        characters[requestIdtoNFT[requestId]].description = description;
        characters[requestIdtoNFT[requestId]].score_c = score_c;
        characters[requestIdtoNFT[requestId]].score_t = score_t;
        characters[requestIdtoNFT[requestId]].score_a = score_a;
        characters[requestIdtoNFT[requestId]].price = price;

        // Emit an event to log the response
        emit Response(requestId, string(response), s_lastResponse, s_lastError);
    }
}
