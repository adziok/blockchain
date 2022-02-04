//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//import "hardhat/console.sol";

contract Token {
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    struct ApprovalStruct {
        address owner;
        address approved_address;
        uint256 approved_amount;
    }

    mapping(address => uint256) balances;
    mapping(address => mapping(address => ApprovalStruct)) approvals;

    constructor() {
        balances[msg.sender] = totalSupply();
        emit Transfer(address(0), msg.sender, totalSupply());
    }

    function name() public view returns (string memory) {
        return "Leocode Token";
    }

    function symbol() public view returns (string memory) {
        return "LEO";
    }

    function decimals() public view returns (uint8) {
        return 18;
    }

    function totalSupply() public view returns (uint256) {
        uint256 base_decimals_multiplier = 10**decimals();
        return 100_000 * base_decimals_multiplier;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        require(_to != address(0), "Can not transfer token to address 0");
        require(balances[msg.sender] >= _value, "Not enough tokens");
        balances[msg.sender] -= _value;
        balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            approvals[_from][msg.sender].approved_amount >= _value,
            "Invalid approval amount"
        );
        require(balances[_from] >= _value, "Not enough tokens");

        approvals[_from][msg.sender].approved_amount -= _value;
        balances[_from] -= _value;
        balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        require(balances[msg.sender] >= _value, "Not enough tokens");
        approvals[msg.sender][_spender] = ApprovalStruct({
            owner: msg.sender,
            approved_address: _spender,
            approved_amount: _value
        });

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256 remaining)
    {
        return approvals[_owner][_spender].approved_amount;
    }
}
