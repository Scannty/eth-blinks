// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDonations {
    struct Campaign {
        uint96 endTimestamp;
        address payable beneficiary;
        string uri;
    }

    event CampaignCreated(uint campaignId, Campaign campaign);
    event Donation(uint campaignId, uint amount, address tokenAddress);

    function isCampaignActive(uint _campaignId) external view returns(bool);
    function getCampaign(uint _campaignId) external view returns(Campaign memory);
    function createCampaign(address payable _beneficiary, uint96 _endTimestamp, string calldata uri) external;
    function donate(uint _campaignId, address _token, uint _amount) external;
    function donateETH(uint _campaignId) external payable;
}