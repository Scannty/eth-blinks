// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReferralExample, IERC20, IUniswapV2Router} from "../contracts/ReferralExample.sol";
import {Test, console} from "forge-std/Test.sol";

contract ReferralExampleTest is Test {
    ReferralExample referralExample;

    function setUp() external {
        vm.createSelectFork("https://ethereum-rpc.publicnode.com"); // Testing on Ethereum mainnet
        IUniswapV2Router uniswapRouter = IUniswapV2Router(
            0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
        ); // Uniswap V2 Router
        referralExample = new ReferralExample(uniswapRouter);
    }

    function test_swapWithReferral() external {
        address referrer = makeAddr("referrer");
        address daiWhale = 0x837c20D568Dfcd35E74E5CC0B8030f9Cebe10A28; // DAI whale
        address[] memory path = new address[](2);
        path[0] = 0x6B175474E89094C44Da98b954EedeAC495271d0F; // DAI
        path[1] = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH
        uint amountIn = 3600000000000000000000; // 3600 DAI
        uint amountOutMin = 0; // For simplicity, we don't set a minimum amount of WETH to receive
        uint deadline = block.timestamp + 300; // 5 minutes from now

        // Balances before for assertions
        uint daiWhaleBalanceBefore = IERC20(path[0]).balanceOf(daiWhale);
        uint referrerBalanceBefore = IERC20(path[0]).balanceOf(referrer);

        // First we need to approve the contract to spend the DAI from the whale
        vm.startPrank(daiWhale);
        IERC20(path[0]).approve(address(referralExample), amountIn);

        referralExample.swapWithReferral(
            referrer,
            amountIn,
            amountOutMin,
            path,
            address(this),
            deadline
        );
        vm.stopPrank();

        // Balances after for assertions
        uint daiWhaleBalanceAfter = IERC20(path[0]).balanceOf(daiWhale);
        uint referrerBalanceAfter = IERC20(path[0]).balanceOf(referrer);

        uint referrerFee = (amountIn * 3) / 10000;

        // Assertions
        assertEq(
            daiWhaleBalanceBefore - amountIn,
            daiWhaleBalanceAfter,
            "DAI whale balance should decrease by the amountIn"
        );
        assertEq(
            referrerBalanceBefore + referrerFee,
            referrerBalanceAfter,
            "Referrer balance should increase by the referral fee"
        );
    }
}
