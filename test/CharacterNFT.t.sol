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
        string memory image = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACK1BMVEVHcEwxMC/NzMxMSkoiIB8+PT2trawEAgIKCQkVExOenZ2Qjo6/vr5YVlaCgYBkYmJubGt4d3Zps1poslny8vGwsrSxs7Xz8/JSoUXx8vJQokZRoEXx8fCvsbOytLZTokZlslnx8vA9PT5nsllSoUebejlRo0dOokbfwmHv8O9oslrewWCefTvewWJOoEa7165ksVdos1lms1u11alosle1triy1Kfy9PS82K/fwmPA27OusLL08vGv0aRVpUtstGC41qy11KcxMS3q6+xXqUz29vZgr1TD27NbrFCvsrQ2NTTl5uYBAgIzUC3S0tK5urs6Ojng4OHZ2dn///+pz5/MzMxprFxRlUe/v7+NjIzFxcZZnE5kpVhyt2hCQUGWlZRmZWScnJyioqJeXVxubmyGhYV+fX2op6h2dXSsrK1WVVRSeEd6unHB3LS/2rGmyJyeypSUxoyzsrOdt5PbvmFMPybUtlylgz+QczyujURoVjN6aD8BAQG8m0zIqVPMsmOMfFG6pF2fi1HCqV6sl1m1n2CFv4KGwISJwIQ7dD+CvoE3cD06cT4EAgI5cD00RC5qomhCekJwiWpim1sGBAQODgyFtIF7s3l/u3xffFodJRkDAgIIBwZzrHFKcUFTZ04WFRULCgmLw4aAmXhckVU8TTYREw8rKigkIyAYHRNEZzwTExNUjEtKgkRDWjwdHBtThUtPUEwVFBQtQSdISEU5XDMjLh2QqIcpNyPzqrcvAAAAEnRSTlMAqAqOuJsr1c/FO0kZgld2bGEnjOHHAAACIklEQVR4nJWSy27TQBSGXYTaBRJCc7HdxHbixCR1mtihpISUiyCBQgm0hQU7Ft2BQGLFC7Cgucx45YBUR8hBbdLAAilqIh6PGYc2sUEIjjc+5//mPzNnRhD+N5Y+/VVeILSx+If6vuM0foxJq9N2HDI4JMRpfCHOx3njFmGS67a8J6SdbhOn2SRLYZPF/UaLtF13+LlNCGl+uFSNdPGvvgAAsg9ACHK3qsI6EufkOyVWTx4MbNu+fuI1ICwqGGFvBsSobYOZQ+nuNUSR9uhMfxt7CNaG2YQ8jUSsP7lpovqcw1c5lo1tQpgLHHKbcUuTkIRmwPkMONJ7dNriOKVfYcTyPCBYAKX80WsOdEd+CskHGIUOanj6wPe7HBgFQCcTD43BmJijAIBTIH4bhCdpWGiH+nTqoOtSPAvDg7QyiLV4zoFvo5Q0jN+LTNqQ1572+8EpkinFTcjFCDB+sAHzl39F2t6wIvrhRAawl18trK5UVvIAyHIEgNUM2//7ApMrhdLvwJvi2IK8/ffKuyT/iQB7Zt0weP30NiNAXd8WrTAQHiPyFJHWaPIMSPfDO+isl5HWe/m4ZJzj6UWreCQIu+VnF06BmoQUSaqZSFF5eoyl2nZN0pGOFgKdvwxU17AqapjnGFMRY5GXdZ577GqQqYkifqUFDjdU9q9ija+jLL/PUEVkNbYqAFQcACoH3KCHb9bZIvFk9gDo3paqlne6wj/ET+okimtGgGQGAAAAAElFTkSuQmCC';
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
