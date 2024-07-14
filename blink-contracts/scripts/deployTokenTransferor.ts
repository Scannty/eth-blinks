import { ethers, network } from "hardhat";
import hre from "hardhat";
import { TokenTransferor, TokenTransferor__factory } from "../typechain-types";

async function main() {
  let [deployer] = await ethers.getSigners();
  let routerAddress: string = "";
  let linkAddress: string = "";

  if (network.name === "baseSepolia") {
    routerAddress = "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93"; // CCIP Router on Base
    linkAddress = "0xE4aB69C077896252FAFBD49EFD26B5D171A32410"; // LINK token on Base
  } else if (network.name === "arbitrumSepolia") {
    routerAddress = "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165"; // Uniswap Router on Arbitrum
    linkAddress = "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E";
  }

  console.log(
    `ℹ️  Attempting to deploy the TokenTransferor smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const TokenTransferorFactory: TokenTransferor__factory =
    (await hre.ethers.getContractFactory(
      "TokenTransferor"
    )) as TokenTransferor__factory;

  const tokenTransferorDeployer: TokenTransferor =
    await TokenTransferorFactory.connect(deployer).deploy(
      routerAddress,
      linkAddress
    );

  const tokenTransferor = await tokenTransferorDeployer.waitForDeployment();
  console.log("✅ Token Transferor:", await tokenTransferor.getAddress());

  // Set Arbitrum as destination chain for the token transferor
  await tokenTransferor.allowlistDestinationChain("10344971235874465080", true); // Allow Arbitrum

  // Fund transferor with ETH for gas fees
  await deployer.sendTransaction({
    to: await tokenTransferor.getAddress(),
    value: ethers.parseEther("0.01"),
  });
  console.log("✅ Token Transferor funded with ETH");

  // Verify the contract on Etherscan
  await hre.run("verify:verify", {
    address: await tokenTransferor.getAddress(),
    constructorArguments: [routerAddress, linkAddress],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
