// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {TokenTransferor, IERC20} from "../contracts/TokenTransferor.sol";
import {Test, console} from "forge-std/Test.sol";

contract TokenTransferorTest is Test {
    TokenTransferor tokenTransferor;
    address constant USDC_WHALE = 0x76d881229E6670759fF4Da9b105B99a6D28Bc429;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function setUp() external {
        string memory rpcEndpoint = vm.envString("BASE_SEPOLIA_URL");
        address ccipRouterAddress = 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93;
        address linkTokenAddress = 0xE4aB69C077896252FAFBD49EFD26B5D171A32410;
        vm.createSelectFork(rpcEndpoint); // Testing on Avalanche Fuji testnet
        vm.startPrank(USDC_WHALE);
        tokenTransferor = new TokenTransferor(
            ccipRouterAddress,
            linkTokenAddress
        );
        tokenTransferor.allowlistDestinationChain(3478487238524512106, true); // Allow Arbitrum
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
            1000000
        ); // 1 USDC
        // Send USDC to Sepolia
        uint64 destinationId = 3478487238524512106;
        uint256 amount = 1000000; // 1 USDC

        tokenTransferor.transferTokensPayNative(
            destinationId,
            receiver,
            USDC,
            amount
        );

        vm.stopPrank();
    }
}
