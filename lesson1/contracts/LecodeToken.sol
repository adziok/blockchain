//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import 'hardhat/console.sol';

contract LEON is ERC1155 {
    uint256 public constant HEDGEHOG = 0;

    constructor() public ERC1155("http://ifglakjndijadsjpagdspgpijagag.s3-website.eu-central-1.amazonaws.com/nfts/nft_{id}.json") {
        _mint(address(msg.sender), HEDGEHOG, 3, "");
    }
}

contract Marketplace is ERC1155Holder {
    IERC20 LEO;
    IERC20 uSDT;
    LEON nft;
    address owner;

    constructor(address _LEO, address _USDT, address _nft) {
        LEO = IERC20(_LEO);
        uSDT = IERC20(_USDT);
        nft = LEON(_nft);
        owner = msg.sender;
    }

    function buyLEOForUSDT(uint256 _amount) public {
        require(_amount / 10 ** 12 >= 100, "Minimal amount to buy is 10^14");
        uint256 usdtToPay = (_amount / 10 ** 12 / 100) * 3;
        require(LEO.transfer(msg.sender, _amount));
        require(uSDT.transferFrom(msg.sender, address(this), usdtToPay));
    }

    function sellLEOForUSDT(uint256 _amount) public {
        require(_amount / 10 ** 12 >= 100, "Minimal amount to sell is 10^14");
        uint256 usdtToPay = (_amount / 10 ** 12 / 100) * 3;
        require(uSDT.transfer(msg.sender, usdtToPay));
        require(LEO.transferFrom(msg.sender, address(this), _amount));
    }

    function buyNFTForUSDT(uint256 _id) public {
        uint256 usdtToPay =  15 * 10 ** 5;
        require(uSDT.transferFrom(msg.sender, address(this), usdtToPay));
        nft.safeTransferFrom(owner, msg.sender, _id, 1, "0x123");
    }

    function sellNFTForUSDT(uint256 _id) public {
        uint256 usdtToPay =  15 * 10 ** 5;
        require(uSDT.transfer(msg.sender, usdtToPay));
        nft.safeTransferFrom(msg.sender, owner, _id, 1, "0x123");
    }

    function buyNFTForLEO(uint256 _id) public {
        uint256 leoToPay =  200 * 10 ** 18;
        require(LEO.transferFrom(msg.sender, address(this), leoToPay));
        nft.safeTransferFrom(owner, msg.sender, _id, 1, "0x123");
    }

    function sellNFTForLEO(uint256 _id) public {
        uint256 leoToPay =  200 * 10 ** 18;
        require(LEO.transfer(msg.sender, leoToPay));
        nft.safeTransferFrom(msg.sender, owner, _id, 1, "0x123");
    }
}

contract USDT is ERC20 {
    constructor() ERC20("USD Token", "USDT") {}

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function gimme(uint256 _amount) public {
        _mint(msg.sender, _amount * (10 ** decimals()));
    }
}

contract LeocodeToken is ERC20 {
    constructor() ERC20("Leocode Token", "LEO") {
        _mint(msg.sender, 100_000 * (10 ** decimals()));
    }
}