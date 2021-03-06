import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";

describe("Token", function () {
  let owner: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let token: Contract;
  const totalSupplyAlsoInitial = BigNumber.from(100_000).mul(
    BigNumber.from("10").pow(18)
  );
  beforeEach(async () => {
    [owner, otherUser] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("Token");
    token = await TokenFactory.deploy();
    await token.deployed();
  });

  describe("token creation", () => {
    it("Should return token details", async () => {
      expect(await token.name()).to.equal("Leocode Token");
      expect(await token.symbol()).to.equal("LEO");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should show valid balance of token creator", async () => {
      expect(await token.balanceOf(owner.address)).to.equal(
        totalSupplyAlsoInitial
      );
    });
  });

  describe("transfers", () => {
    it("Should transfer 100 tokens to other user", async () => {
      await token.transfer(otherUser.address, 100);
      expect(await token.balanceOf(otherUser.address)).to.equal(100);
      expect(await token.balanceOf(owner.address)).to.equal(
        totalSupplyAlsoInitial.sub(100).toString()
      );
    });

    it("Should throw when transfer to address 0", async () => {
      const address0 = "0x0000000000000000000000000000000000000000";

      await expect(token.transfer(address0, 100)).to.be.revertedWith(
        "Can not transfer token to address 0"
      );
      expect(await token.balanceOf(owner.address)).to.equal(
        totalSupplyAlsoInitial
      );
    });
  });

  describe("approve and transfer from", () => {
    it("Should approve to transfer 100", async () => {
      await token.approve(otherUser.address, 100);

      expect(await token.allowance(owner.address, otherUser.address)).to.equal(
        100
      );
    });

    it("Should transfer from 100 token and decrease approval", async () => {
      await token.approve(otherUser.address, 100);
      await token
        .connect(otherUser)
        .transferFrom(owner.address, otherUser.address, 100);

      expect(await token.allowance(owner.address, otherUser.address)).to.equal(
        0
      );
    });

    it("Should throw when try transfer with not enough approval", async () => {
      await token.approve(otherUser.address, 100);
      await expect(
        token
          .connect(otherUser)
          .transferFrom(owner.address, otherUser.address, 120)
      ).to.revertedWith("Invalid approval amount");

      expect(await token.allowance(owner.address, otherUser.address)).to.equal(
        100
      );
    });
  });
});
