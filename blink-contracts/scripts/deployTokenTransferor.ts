import { ethers, network } from "hardhat";
import hre from "hardhat";
import { TokenTransferor, TokenTransferor__factory } from "../typechain-types";

async function main() {
  let [deployer] = await ethers.getSigners();
  let routerAddress: string = "";
  let linkAddress: string = "";

  if (network.name === "baseFork") {
    routerAddress = "0x881e3A65B4d4a04dD529061dd0071cf975F58bCD"; // CCIP Router on Arbitrum
    linkAddress = "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196"; // LINK token on Arbitrum
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
  await tokenTransferor.allowlistDestinationChain("4949039107694359620", true); // Allow Arbitrum

  // Fund transferor with ETH for gas fees
    await deployer.sendTransaction({
        to: await tokenTransferor.getAddress(),
        value: ethers.parseEther("1"),
    });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
