import { ethers, network } from "hardhat";
import hre from "hardhat";
import { ReferralExample, ReferralExample__factory } from "../typechain-types";

async function main() {
  let [deployer] = await ethers.getSigners();
  let routerAddress: string = "";

  if (network.name === "ethereumFork") {
    routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  }

  console.log(
    `ℹ️  Attempting to deploy the ReferralExample smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const ReferralExampleFactory: ReferralExample__factory =
    (await hre.ethers.getContractFactory(
      "ReferralExample"
    )) as ReferralExample__factory;

  const referralExampleDeployer: ReferralExample =
    await ReferralExampleFactory.connect(deployer).deploy(routerAddress);

  const referralExample = await referralExampleDeployer.waitForDeployment();
  console.log("✅ Referral Example:", await referralExample.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
