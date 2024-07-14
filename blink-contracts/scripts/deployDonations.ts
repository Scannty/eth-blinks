import { ethers, network } from "hardhat";
import hre from "hardhat";
import { Donations, Donations__factory } from "../typechain-types";

async function main() {
  let [deployer] = await ethers.getSigners();

  console.log(
    `ℹ️  Attempting to deploy the Donations smart contract to the ${hre.network.name} blockchain using ${deployer.address} address`
  );

  const DonationsFactory: Donations__factory =
    (await hre.ethers.getContractFactory("Donations")) as Donations__factory;

  const donationsDeployer: Donations =
    await DonationsFactory.connect(deployer).deploy();

  const donations = await donationsDeployer.waitForDeployment();
  console.log("✅ Donations:", await donations.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
