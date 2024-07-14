// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";
import "./interfaces/IDonations.sol";

contract Donations is IDonations {
    Campaign[] public campaigns;

    function isCampaignActive(
        uint _campaignId
    ) public view override returns (bool) {
        return campaigns[_campaignId].endTimestamp > block.timestamp;
    }

    function getCampaign(
        uint _campaignId
    ) public view override returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    function createCampaign(
        address payable _beneficiary,
        uint96 _endTimestamp,
        string calldata uri
    ) external override {
        require(
            _endTimestamp > block.timestamp,
            "Donations::createCampaign: Campaign must end in the future"
        );

        address payable beneficiary;
        if (_beneficiary != address(0)) {
            beneficiary = _beneficiary;
        } else {
            beneficiary = payable(msg.sender);
        }

        Campaign memory campaign = Campaign(_endTimestamp, beneficiary, uri);
        uint campaignId = campaigns.length;

        campaigns.push(campaign);

        emit CampaignCreated(campaignId, campaign);
    }
    /// @dev Use SafeERC20 to transfer tokens in production
    function donate(
        uint _campaignId,
        address _token,
        uint _amount
    ) external override {
        require(
            _campaignId < campaigns.length,
            "Donations::donate: Non existent campaign id provided"
        );
        require(
            isCampaignActive(_campaignId),
            "Donations::donate: Campaign not active"
        );

        address beneficiary = campaigns[_campaignId].beneficiary;

        IERC20(_token).transferFrom(msg.sender, beneficiary, _amount);
        emit Donation(_campaignId, _amount, _token);
    }

    function donateETH(uint _campaignId) external payable override {
        require(
            _campaignId < campaigns.length,
            "Donations::donateETH: Non existent campaign id provided"
        );
        require(
            isCampaignActive(_campaignId),
            "Donations::donateETH: Campaign not active"
        );
        require(msg.value > 0, "Donations::donateETH: You must send ether");

        Campaign memory campaign = campaigns[_campaignId];
        campaign.beneficiary.transfer(msg.value);

        emit Donation(_campaignId, msg.value, address(0));
    }
}
