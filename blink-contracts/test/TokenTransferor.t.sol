// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TokenTransferor, IERC20} from "../contracts/TokenTransferor.sol";
import {Test, console} from "forge-std/Test.sol";

contract TokenTransferorTest is Test {
    TokenTransferor tokenTransferor;
    address constant USDC_WHALE = 0xaA868dACbA543AacE30d69177b7d44047c2Fe27A;
    address constant USDC = 0x5425890298aed601595a70AB815c96711a31Bc65;

    function setUp() external {
        string memory rpcEndpoint = vm.envString("AVALANCHE_FORK_URL");
        address ccipRouterAddress = 0xF694E193200268f9a4868e4Aa017A0118C9a8177;
        address linkTokenAddress = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846;
        vm.createSelectFork(rpcEndpoint); // Testing on Avalanche Fuji testnet
        vm.startPrank(USDC_WHALE);
        tokenTransferor = new TokenTransferor(
            ccipRouterAddress,
            linkTokenAddress
        );
        tokenTransferor.allowlistDestinationChain(16015286601757825753, true);
        vm.stopPrank();
    }

    function testTokenTransferor() external {
        address receiver = makeAddr("receiver");
        // Give usdc whale 10 AVAX
        vm.deal(USDC_WHALE, 10 ether);
        vm.startPrank(USDC_WHALE);
        // Send 1 AVAX to the token transferor contract
        payable(address(tokenTransferor)).transfer(1 ether);
        IERC20(USDC).transfer(
            address(tokenTransferor),
            10000000
        ); // 10 USDC
        // Send USDC to Sepolia
        uint64 destinationId = 16015286601757825753;
        uint256 amount = 10000000; // 10 USDC

        tokenTransferor.transferTokensPayNative(
            destinationId,
            receiver,
            USDC,
            amount
        );

        vm.stopPrank();
    }
}
