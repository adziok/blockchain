import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("LeocodeToken", function () {
  let owner: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let token: Contract;

  beforeEach(async () => {
    [owner, otherUser] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("LeocodeToken");
    token = await TokenFactory.deploy();
    await token.deployed();
  });

  describe("Buy", () => {
    it("Should buy 100 leocode tokens for 1 eth", async () => {
      await token.buy({ value: ethers.utils.parseEther("1.0") });

      expect(await token.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("1.0").mul(100)
      );
    });

    it("Should not be able to buy two times in one week", async () => {
      await token.buy({ value: ethers.utils.parseEther("1.0") });

      await expect(
        token.buy({ value: ethers.utils.parseEther("1.0") })
      ).to.revertedWith("Token already bought in less than a week");
    });

    it("Should not be able to buy more than total supply", async () => {
      await token.buy({ value: ethers.utils.parseEther("1000.0") });

      await expect(
        token.connect(otherUser).buy({ value: ethers.utils.parseEther("1.0") })
      ).to.revertedWith("Token limit exceeded");
    });

    it("Should not be able to buy for 0 eth", async () => {
      await expect(
        token.buy({ value: ethers.utils.parseEther("0") })
      ).to.revertedWith("Value must be greater than 0");
    });

    it("Should able to buy more tokens after week from last transaction", async () => {
      const weekInSeconds = 7 * 24 * 60 * 60;
      await token.buy({ value: ethers.utils.parseEther("1.0") });
      await ethers.provider.send("evm_increaseTime", [weekInSeconds]);
      await token.buy({ value: ethers.utils.parseEther("1.0") });

      expect(await token.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("2.0").mul(100)
      );
    });
  });

  describe("transfers", () => {
    beforeEach(async () => {
      await token.buy({ value: ethers.utils.parseEther("1.0") });
    });

    it("Should not be able to transfer tokens for one week from bought moment", async () => {
      await expect(token.transfer(otherUser.address, 100)).to.revertedWith(
        "Not enough available tokens"
      );
    });

    it("Should not be able to transfer tokens for one week from bought moment", async () => {
      const weekInSeconds = 7 * 24 * 60 * 60;
      await ethers.provider.send("evm_increaseTime", [weekInSeconds]);

      await expect(token.transfer(otherUser.address, 100)).not.to.revertedWith(
        "Not enough available tokens"
      );
    });
  });

  it("Owner should be able to get eth from contract", async () => {
    await token.buy({ value: ethers.utils.parseEther("1.0") });
    const balance = await owner.getBalance();
    await token.payMeUp();
    expect(balance).to.lt(await owner.getBalance());
  });
});
