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
    const nftFactory = await ethers.getContractFactory("LEON");
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
      await usdtToken.gimme(2000000);
      await usdtToken.approve(
        marketplaceToken.address,
        BigNumber.from("2000000").mul(BigNumber.from("10").pow(6))
      );
      await leoToken.transfer(
        marketplaceToken.address,
        BigNumber.from("100000").mul(BigNumber.from("10").pow(18))
      );
    });

    it("Should buy 100 leo", async () => {
      await marketplaceToken.buyLEOForUSDT(
        BigNumber.from("100").mul(BigNumber.from("10").pow(18))
      );

      expect(await leoToken.balanceOf(owner.address)).to.eq(
        BigNumber.from("100").mul(BigNumber.from("10").pow(18))
      );
      expect(await usdtToken.balanceOf(owner.address)).to.eq(
        BigNumber.from("2000000")
          .mul(BigNumber.from("10").pow(6))
          .sub(BigNumber.from("3").mul(BigNumber.from("10").pow(6)))
      );
    });

    it("Should sell 100 leo", async () => {
      await marketplaceToken.buyLEOForUSDT(
        BigNumber.from("100").mul(BigNumber.from("10").pow(18))
      );
      await leoToken.approve(
        marketplaceToken.address,
        BigNumber.from("100").mul(BigNumber.from("10").pow(18))
      );

      await marketplaceToken.sellLEOForUSDT(
        BigNumber.from("100").mul(BigNumber.from("10").pow(18))
      );

      expect(await leoToken.balanceOf(owner.address)).to.eq(0);
      expect(await usdtToken.balanceOf(owner.address)).to.eq(
        BigNumber.from("2000000").mul(BigNumber.from("10").pow(6))
      );
    });
  });

  describe("Buy LEON", () => {
    beforeEach(async () => {
      await usdtToken.connect(otherUser).gimme(2000000);
      await usdtToken
        .connect(otherUser)
        .approve(
          marketplaceToken.address,
          BigNumber.from("2000000").mul(BigNumber.from("10").pow(6))
        );
      await leoToken.transfer(
        marketplaceToken.address,
        BigNumber.from("100000").mul(BigNumber.from("10").pow(18))
      );
      await nftToken.setApprovalForAll(marketplaceToken.address, true);
      await marketplaceToken
        .connect(otherUser)
        .buyLEOForUSDT(BigNumber.from("200").mul(BigNumber.from("10").pow(18)));
      await leoToken
        .connect(otherUser)
        .approve(
          marketplaceToken.address,
          BigNumber.from("200").mul(BigNumber.from("10").pow(18))
        );
      await usdtToken
        .connect(otherUser)
        .approve(
          marketplaceToken.address,
          BigNumber.from("5").mul(BigNumber.from("10").pow(6))
        );
    });

    it("Should buy LOEN for 200 leo", async () => {
      await marketplaceToken.connect(otherUser).buyNFTForLEO();
      expect(
        await nftToken.connect(otherUser).balanceOf(otherUser.address, 0)
      ).to.eq(1);
      expect(
        await leoToken.connect(otherUser).balanceOf(otherUser.address)
      ).to.eq(BigNumber.from("0"));
    });

    it("Should sell LEON for 200 leo", async () => {
      await marketplaceToken.connect(otherUser).buyNFTForLEO(0);
      await nftToken
        .connect(otherUser)
        .setApprovalForAll(marketplaceToken.address, true);
      await marketplaceToken.connect(otherUser).sellNFTForLEO(0);

      expect(
        await nftToken.connect(otherUser).balanceOf(otherUser.address, 0)
      ).to.eq(0);
      expect(
        await leoToken.connect(otherUser).balanceOf(otherUser.address)
      ).to.eq(BigNumber.from("200").mul(BigNumber.from("10").pow(18)));
    });

    it.only("Should buy LOEN for 1,5 usdt", async () => {
      await marketplaceToken.connect(otherUser).buyNFTForUSDT(0);

      expect(
        await nftToken.connect(otherUser).balanceOf(otherUser.address, 0)
      ).to.eq(1);
    });

    it.only("Should sell LEON for 1,5 usdt", async () => {
      await marketplaceToken.connect(otherUser).buyNFTForUSDT(0);
      await nftToken
        .connect(otherUser)
        .setApprovalForAll(marketplaceToken.address, true);
      await marketplaceToken.connect(otherUser).sellNFTForUSDT(0);

      expect(
        await nftToken.connect(otherUser).balanceOf(otherUser.address, 0)
      ).to.eq(0);
    });
  });
});
