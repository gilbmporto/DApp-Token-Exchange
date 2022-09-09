// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    //Track Balances
    mapping (address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;    
    }

    function transfer(address _to, uint256 _value) 
        public 
        returns (bool success) 
    {
        //Require that sender has enough tokens to spend
        require(balanceOf[msg.sender] >= _value);

        //Most of the code of transfer function has been moved to the internal function _transfer
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal {
        require(_to != address(0));

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) 
    public 
    returns (bool success) 
    {
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from, 
        address _to, 
        uint256 _value) 
    public 
    returns (bool success) {

        //check approval
        require(_value <= allowance[_from][msg.sender]);
        require(_value <= balanceOf[_from]);

        //Reset Allowance
        allowance[_from][msg.sender] -= _value;

        //spend tokens
        _transfer(_from, _to, _value);

        return true;
    }

}
