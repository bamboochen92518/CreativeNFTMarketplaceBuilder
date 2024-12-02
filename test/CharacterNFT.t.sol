// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {Test, console2} from "forge-std/Test.sol";
import {CharacterNFT} from "src/CharacterNFT.sol";

/**
 * DO NOT MODIFY THIS FILE, OR YOU WILL GET ZERO POINTS FROM THIS CHALLENGE
 */
contract CharacterNFTTest is Test {
    address internal user;
    address internal owner;
    address internal bidder0;
    address internal bidder1;
    address internal bidder2;

    CharacterNFT internal characterNFTContract;

    uint256 public UPLOAD_FEE = 10 ether;
    uint256 public REGRADE_FEE = 5 ether;

    function setUp() public virtual {
        // Role
        user = makeAddr("user");
        owner = makeAddr("owner");
        bidder0 = makeAddr("bidder0");
        bidder1 = makeAddr("bidder1");
        bidder2 = makeAddr("bidder2");

        vm.startPrank(owner);
        characterNFTContract = new CharacterNFT();
        vm.stopPrank();

    }

    function testUploadCharacter() public {
        // Give user 50 ether
        vm.deal(user, 50 ether);

        // User want to mint a NFT
        vm.startPrank(user);
        string memory image = '123hihi';
        characterNFTContract.uploadCharacter{value: UPLOAD_FEE}(user, image);
        assertEq(address(user).balance, 40 ether);
        assertEq(characterNFTContract.ownerOf(0), address(user));
        assertEq(characterNFTContract.characterCounter(), 1);
        vm.stopPrank();
    }

    function testRegradeCharacter() public {
        // Base on testUploadCharacter()
        testUploadCharacter();

        // Other people want to regrade NFT => revert
        vm.startPrank(bidder0);
        vm.expectRevert();
        characterNFTContract.regradeCharacter{value: REGRADE_FEE}(0);
        vm.stopPrank();

        // User want to regrade a NFT for 3 times
        vm.startPrank(user);
        for (uint256 i = 0; i < 3; i++) {
            characterNFTContract.regradeCharacter{value: REGRADE_FEE}(0);
            assertEq(address(user).balance, (35 - i * 5) * 1 ether);
        }
        vm.stopPrank();

        // User want to regrade more than 3 times => revert
        vm.startPrank(user);
        vm.expectRevert();
        characterNFTContract.regradeCharacter{value: REGRADE_FEE}(0);
        vm.stopPrank();
    }

    function testBidCharacter() public {
        // Base on testUploadCharacter()
        testUploadCharacter();

        // Give some token to bidder
        vm.deal(bidder0, 20 ether);
        vm.deal(bidder1, 20 ether);
        vm.deal(bidder2, 20 ether);
        
        // Bidder want to buy NFT0
        vm.prank(bidder0);
        characterNFTContract.bidCharacter{value: 5 ether}(0);
        vm.prank(bidder1);
        characterNFTContract.bidCharacter{value: 15 ether}(0);
        vm.prank(bidder2);
        characterNFTContract.bidCharacter{value: 10 ether}(0);

        assertEq(address(bidder0).balance, 15 ether);
        assertEq(address(bidder1).balance, 5 ether);
        assertEq(address(bidder2).balance, 10 ether);
    }
}
