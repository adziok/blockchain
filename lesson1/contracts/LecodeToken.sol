//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import 'hardhat/console.sol';


contract Ownable {
    address owner;
    constructor() public {
        owner = msg.sender;
    }
    modifier isOwner {
        require(msg.sender == owner);
        _;
    }
}

contract LeocodeToken is ERC20, Ownable {
    struct Vesting {
        uint256 releasedAt;
        uint256 amount;
    }

    mapping(address => Vesting) private _vestings;


    constructor() ERC20("Leocode Token", "LEO") {
        _mint(address(this), 100_000 * (10 ** decimals()));
    }

    function buy() public payable {
        require(msg.value > 0, "Value must be greater than 0");
        uint256 amountToBuy = msg.value * 100;
        require(balanceOf(address(this)) >= amountToBuy, "Token limit exceeded");
        require(isBuyInLessThanWeekAgo() == false, "Token already bought in less than a week");
        _vestings[msg.sender] = Vesting({
            releasedAt: block.timestamp + (7 days),
            amount: amountToBuy
        });
        _transfer(address(this), msg.sender, amountToBuy);
    }

    function payMeUp() public isOwner {
        address payable ownerPayable = payable(owner);
        ownerPayable.transfer(address(this).balance);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if(from != address(0) && from != address(this)) {
            require(amount < balanceOf(from) - getLockedTokensAmount(from), "Not enough available tokens");
        }
    }

    function getLockedTokensAmount(address sender) public view returns (uint256) {
        if (_vestings[sender].releasedAt > block.timestamp) {
            return _vestings[sender].amount;
        }
        return 0;
    }

    function isBuyInLessThanWeekAgo() public view returns (bool) {
        if (_vestings[msg.sender].releasedAt > block.timestamp) {
            return true;
        }
        return false;
    }
}