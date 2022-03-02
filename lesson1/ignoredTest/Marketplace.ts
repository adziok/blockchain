import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";

describe("Marketplace", function () {
  let owner: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let marketplaceToken: Contract;
  let usdtToken: Contract;
  let leoToken: Contract;
  let nftToken: Contract;

  beforeEach(async () => {
    [owner, otherUser] = await ethers.getSigners();
    const usdtFactory = await ethers.getContractFactory("USDT");
    const leoFactory = await ethers.getContractFactory("LeocodeToken");
    const nftFactory = await ethers.getContractFactory("GoodStaffToken");
    const marketplaceFactory = await ethers.getContractFactory("Marketplace");
    usdtToken = await usdtFactory.deploy();
    leoToken = await leoFactory.deploy();
    nftToken = await nftFactory.deploy();
    marketplaceToken = await marketplaceFactory.deploy(
      leoToken.address,
      usdtToken.address,
      nftToken.address
    );
    await marketplaceToken.deployed();
  });

  describe("Buy leo", () => {
    beforeEach(async () => {
      await usdtToken.gimme(2000);
    });

    it("Should buy 100 leo", async () => {
      await marketplaceToken.buyLEOForUSDT(100);

      expect(await leoToken.balanceOf(owner.address)).to.eq(
        BigNumber.from("100").mul(BigNumber.from("10").pow(18))
      );
    });
  });
});
