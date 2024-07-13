import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "shanghai",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    // npx hardhat verify --network networkName {contractAddress} [{constructor arguments}]
    apiKey:
      process.env.ETHERSCAN_API_KEY !== undefined
        ? process.env.ETHERSCAN_API_KEY
        : "",
  },
  sourcify: {
    enabled: true,
  },
  networks: {
    ethereumFork: {
      url: process.env.ETHEREUM_FORK_URL,
      chainId: 1,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
