// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import openzeppelin
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Import ChainLink
import {FunctionsClient} from "@chainlink/contracts/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract CharacterNFT is ERC721Enumerable, Ownable {
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
    uint256 public UPLOAD_FEE = 10 ether;
    uint256 public REGRADE_FEE = 5 ether;
    uint256 public REGRADE_TIME = 3;
    uint256 public MAX_SCORE = 5;

    mapping(uint256 => Character) public characters; // NFT ID to Character
    mapping(uint256 => uint256) public leftRegradeTimes; // NFT ID to regrading opportunities
    mapping(uint256 => address[]) public bidders; // NFT ID to list of bidders
    mapping(uint256 => mapping(address => uint256)) public bids; // NFT ID to (bidder -> bid amount)
    mapping(uint256 => mapping(address => string)) public reports; // NFT ID to (reporter -> reason)

    constructor() ERC721("CharacterNFT", "CNFT") Ownable(msg.sender) {}

    // Users can upload their self-created character by sending sufficient native tokens
    function uploadCharacter(address creator, string memory image) external payable {
        require(msg.value >= UPLOAD_FEE, "Not enough ether sent"); // Ensure sufficient ether is sent

        uint256 newCharacterId = characterCounter++;
        _safeMint(creator, newCharacterId);

        (string memory description, uint256 score_c, uint256 score_t, uint256 score_a, uint256 price) = gradeCharacter(image);

        characters[newCharacterId] = Character({
            image: image,
            creator: creator,
            owner: creator,
            description: description,
            score_c: score_c,
            score_t: score_t,
            score_a: score_a,
            price: price
        });

        leftRegradeTimes[newCharacterId] = REGRADE_TIME;
    }

    // Grades a character based on the image
    function gradeCharacter(string memory image)
        internal
        returns (string memory description, uint256 score_c, uint256 score_t, uint256 score_a, uint256 price)
    {
        // Example grading logic: Randomized scores (to be replaced with real grading logic)
        score_c = uint256(keccak256(abi.encodePacked(image))) % (MAX_SCORE + 1);
        score_t = uint256(keccak256(abi.encodePacked(image, "t"))) % (MAX_SCORE + 1);
        score_a = uint256(keccak256(abi.encodePacked(image, "a"))) % (MAX_SCORE + 1);
        price = (score_c + score_t + score_a) * 1 ether;
        description = string(abi.encodePacked("This character has a grade of ", toString(price), "."));
    }

    // Allows the owner of an NFT to request a regrade
    function regradeCharacter(uint256 NFTID) external payable {
        require(msg.value >= REGRADE_FEE, "Not enough ether sent");
        require(msg.sender == characters[NFTID].owner, "Only the owner can request a regrade");
        require(leftRegradeTimes[NFTID] > 0, "No more regrade attempts available");

        leftRegradeTimes[NFTID]--;

        (string memory description, uint256 score_c, uint256 score_t, uint256 score_a, uint256 price) = gradeCharacter(characters[NFTID].image);

        characters[NFTID].description = description;
        characters[NFTID].score_c = score_c;
        characters[NFTID].score_t = score_t;
        characters[NFTID].score_a = score_a;
        characters[NFTID].price = price;
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

    // Helper function to convert uint256 to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
