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
    uint256 _ethAmount = 0;
    struct Vesting {
        uint256 createdAt;
        uint256 amount;
    }

    mapping(address => Vesting[]) private _vestings;


    constructor() ERC20("Leocode Token", "LEO") {
        _mint(address(this), 100_000 * (10 ** decimals()));
    }

    function buy() public payable {
        uint256 amountToBuy = msg.value * 100;
        require(balanceOf(address(this)) >= amountToBuy, "Token limit exceeded");
        require(isBuyInLessThanWeekAgo() == false, "Token already bought in less than a week");
        _vestings[msg.sender].push(Vesting({
            createdAt: block.timestamp,
            amount: amountToBuy
        }));
        _transfer(address(this), msg.sender, amountToBuy);
        _ethAmount+=msg.value;
    }

    function payMeUp() public isOwner {
        address payable ownerPayable = payable(owner);
        ownerPayable.transfer(_ethAmount);
        _ethAmount = 0;
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

    function gimme(uint256 _amount) public {
        _mint(msg.sender, _amount * (10 ** decimals()));
    }

    function getLockedTokensAmount(address sender) public view returns (uint256) {
        uint256 _availableAmount = 0;
        for (uint i = 0; i < _vestings[sender].length; i++) {
            if (_vestings[sender][i].createdAt + (7 days) > block.timestamp) {
                _availableAmount += _vestings[sender][i].amount;
            }
        }
        return _availableAmount;
    }

    function isBuyInLessThanWeekAgo() public view returns (bool) {
        bool _isBuyInLessThanWeekAgo = false;
        for (uint i = 0; i < _vestings[msg.sender].length; i++) {
            if (_vestings[msg.sender][i].createdAt + (7 days) > block.timestamp) {
                _isBuyInLessThanWeekAgo = true;
            }
        }
        return _isBuyInLessThanWeekAgo;
    }
}