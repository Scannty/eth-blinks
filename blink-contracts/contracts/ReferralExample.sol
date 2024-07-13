// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {IUniswapV2Router} from "./interfaces/IUniswapV2Router.sol";
import {IERC20} from "./interfaces/IERC20.sol";

/// @title ReferralExample
/// @notice A simple contract example that swaps tokens on Uniswap with a referral fee
contract ReferralExample {
    IUniswapV2Router immutable i_router;

    event ReferralShare(
        uint amount,
        address referrer,
        address referee,
        uint timestamp
    );

    constructor(IUniswapV2Router router) {
        i_router = router;
    }

    /// @dev Approve the contract before transferring the tokens
    function swapWithReferral(
        address referrer,
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address /*to*/,
        uint deadline
    ) external returns (uint[] memory amounts) {
        // Calculate referral fee (0.03% of amountIn)
        uint referralFee = (amountIn * 3) / 10000;
        uint amountInAfterFee = amountIn - referralFee;

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn); // @dev change this to safeTransferFrom if you want to handle ERC20 tokens that don't return a boolean value

        // Transfer referral fee to the referrer
        IERC20(path[0]).transfer(referrer, referralFee);

        // Approve the router to spend the tokens
        IERC20(path[0]).approve(address(i_router), amountInAfterFee);

        // Emit the ReferralShare event
        emit ReferralShare(referralFee, referrer, msg.sender, block.timestamp);

        return
            i_router.swapExactTokensForTokens(
                amountInAfterFee,
                amountOutMin,
                path,
                msg.sender,
                deadline
            );
    }
}
