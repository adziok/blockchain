// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { BigNumber } from "ethers";
import { LeocodeToken, LEON } from "../typechain";

type DeploymentProgress = {
  LEO?: string;
  USDT?: string;
  MARKET?: string;
  NFT?: string;
};

const loadProgressObject = (): DeploymentProgress => {
  try {
    const data = fs.readFileSync(path.join(__dirname, "progress.json"), {
      encoding: "utf8",
      flag: "r",
    });
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
};

const saveProgressObject = (data: DeploymentProgress) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, "progress.json"),
      JSON.stringify(data, null, 4),
      {
        encoding: "utf8",
      }
    );
  } catch (e) {
    console.log(e);
  }
};

const saveDeploymentAndRemoveProgressFile = (data: DeploymentProgress) => {
  try {
    fs.writeFileSync(
      path.join(__dirname, "deployment.json"),
      JSON.stringify(data, null, 4),
      {
        encoding: "utf8",
      }
    );
    fs.unlinkSync(path.join(__dirname, "progress.json"));
  } catch (e) {
    console.log(e);
  }
};

const copyFilesToFrontend = () => {
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  fs.copyFileSync(
    path.join(__dirname, "deployment.json"),
    path.join(
      __dirname,
      "..",
      "..",
      "blockchain-app",
      "src",
      "blockchain",
      "deployment.json"
    )
  );
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  fs.copyFileSync(
    path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "LecodeToken.sol",
      "LeocodeToken.json"
    ),
    path.join(
      __dirname,
      "..",
      "..",
      "blockchain-app",
      "src",
      "blockchain",
      "LeocodeToken.json"
    )
  );
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  fs.copyFileSync(
    path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "LecodeToken.sol",
      "LEON.json"
    ),
    path.join(
      __dirname,
      "..",
      "..",
      "blockchain-app",
      "src",
      "blockchain",
      "LEON.json"
    )
  );
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  fs.copyFileSync(
    path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "LecodeToken.sol",
      "USDT.json"
    ),
    path.join(
      __dirname,
      "..",
      "..",
      "blockchain-app",
      "src",
      "blockchain",
      "USDT.json"
    )
  );
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  fs.copyFileSync(
    path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "LecodeToken.sol",
      "Marketplace.json"
    ),
    path.join(
      __dirname,
      "..",
      "..",
      "blockchain-app",
      "src",
      "blockchain",
      "Marketplace.json"
    )
  );
};

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const progress = loadProgressObject();
  let leocodeToken: LeocodeToken;
  let nft: LEON;

  if (!progress.LEO) {
    const LeocodeToken = await ethers.getContractFactory("LeocodeToken");
    leocodeToken = await LeocodeToken.deploy();

    await leocodeToken.deployed();

    progress.LEO = leocodeToken.address;
    saveProgressObject(progress);
    console.log("LeocodeToken deployed to:", leocodeToken.address);
  }

  if (!progress.USDT) {
    const USDT = await ethers.getContractFactory("USDT");
    const uSDT = await USDT.deploy();

    await uSDT.deployed();

    progress.USDT = uSDT.address;
    saveProgressObject(progress);
    console.log("USDT deployed to:", uSDT.address);
  }

  if (!progress.NFT) {
    const Nft = await ethers.getContractFactory("LEON");
    nft = await Nft.deploy();

    await nft.deployed();

    progress.NFT = nft.address;
    saveProgressObject(progress);
    console.log("NFT deployed to:", nft.address);
  }

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    progress.LEO,
    progress.USDT,
    progress.NFT
  );

  await marketplace.deployed();

  progress.MARKET = marketplace.address;

  await leocodeToken!.transfer(
    marketplace.address,
    BigNumber.from("100000").mul(BigNumber.from("10").pow(18))
  );
  await nft!.setApprovalForAll(marketplace.address, true);
  // await nft!.safeTransferFrom(
  //   await marketplace.owner(),
  //   marketplace.address,
  //   0,
  //   3,
  //   ethers.utils.randomBytes(8)
  // );
  saveDeploymentAndRemoveProgressFile(progress);
  copyFilesToFrontend();
  console.log("Marketplace deployed to:", marketplace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
