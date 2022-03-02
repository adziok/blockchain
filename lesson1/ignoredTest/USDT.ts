import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";

describe("USDT", function () {
  let owner: SignerWithAddress;
  let otherUser: SignerWithAddress;
  let token: Contract;
  beforeEach(async () => {
    [owner, otherUser] = await ethers.getSigners();
    const TokenFactory = await ethers.getContractFactory("USDT");
    token = await TokenFactory.deploy();
    await token.deployed();
  });

  describe("token creation", () => {
    it("Should return token details", async () => {
      expect(await token.name()).to.equal("USD Token");
      expect(await token.symbol()).to.equal("USDT");
      expect(await token.decimals()).to.equal(6);
    });

    it("Should gimme money", async () => {
      await token.gimme(2000);
      expect(await token.balanceOf(owner.address)).to.eq(
        BigNumber.from("2000").mul(BigNumber.from("10").pow(6))
      );
    });
  });
});
