// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {Test, console2} from "forge-std/Test.sol";
import {CharacterNFT} from "src/CharacterNFT.sol";

/**
 * DO NOT MODIFY THIS FILE, OR YOU WILL GET ZERO POINTS FROM THIS CHALLENGE
 */
contract CharacterNFTTest is Test {
    address internal user;

    CharacterNFT internal characterNFTContract;

    uint256 public UPLOAD_FEE = 10 ether;
    uint256 public REGRADE_FEE = 5 ether;

    function setUp() public virtual {
        // Role
        user = makeAddr("user");

        characterNFTContract = new CharacterNFT();

        vm.deal(user, 50 ether);
    }

    function testUploadCharacter() public {
        vm.startPrank(user);
        string memory image = '123hihi';
        characterNFTContract.uploadCharacter{value: UPLOAD_FEE}(user, image);
        assertEq(address(user).balance, 40 ether);
        assertEq(characterNFTContract.ownerOf(0), address(user));
        assertEq(characterNFTContract.characterCounter(), 1);
        vm.stopPrank();
    }
}
