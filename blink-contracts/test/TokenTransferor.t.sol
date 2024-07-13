// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TokenTransferor, IERC20} from "../contracts/TokenTransferor.sol";
import {Test, console} from "forge-std/Test.sol";

contract TokenTransferorTest is Test {
    TokenTransferor tokenTransferor;
    address constant USDC_WHALE = 0x0B0A5886664376F59C351ba3f598C8A8B4D0A6f3;
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    function setUp() external {
        string memory rpcEndpoint = vm.envString("BASE_URL");
        address ccipRouterAddress = 0x881e3A65B4d4a04dD529061dd0071cf975F58bCD;
        address linkTokenAddress = 0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196;
        vm.createSelectFork(rpcEndpoint); // Testing on Avalanche Fuji testnet
        vm.startPrank(USDC_WHALE);
        tokenTransferor = new TokenTransferor(
            ccipRouterAddress,
            linkTokenAddress
        );
        tokenTransferor.allowlistDestinationChain(4949039107694359620, true); // Allow Arbitrum
        vm.stopPrank();
    }

    function testTokenTransferor() external {
        address receiver = makeAddr("receiver");
        // Give usdc whale 10 ETHER
        vm.deal(USDC_WHALE, 10 ether);
        vm.startPrank(USDC_WHALE);
        // Send 1 ETH to the token transferor contract
        payable(address(tokenTransferor)).transfer(1 ether);
        IERC20(USDC).transfer(
            address(tokenTransferor),
            10000000
        ); // 10 USDC
        // Send USDC to Sepolia
        uint64 destinationId = 4949039107694359620;
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
