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
  await tokenTransferor.allowlistDestinationChain("3478487238524512106", true); // Allow Arbitrum

  // Fund transferor with ETH for gas fees
  await deployer.sendTransaction({
    to: await tokenTransferor.getAddress(),
    value: ethers.parseEther("0.1"),
  });
  console.log("✅ Token Transferor funded with ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
