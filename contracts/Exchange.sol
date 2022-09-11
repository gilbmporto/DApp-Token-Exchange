//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping (address => mapping (address => uint256)) public tokens;
    mapping (uint256 => _Order) public orders;
    uint256 public ordersCount; //Starts at 0

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

    //A way to model the order
    struct _Order {
        //Attributes of an order
        uint256 id; //Unique identifier for each order
        address user; // User who made order
        address tokenGet; // Address of the token they receive
        uint256 amountGet; // Amount they receive
        address tokenGive; // Address of the token they give
        uint256 amountGive; // Amount they give
        uint256 timeStamp; //When order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    //Deposit Tokens
    function depositToken(address _token, uint256 _amount) public {
        //Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        //Update user balance
        tokens[_token][msg.sender] += _amount;
        //Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        //Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);

        //Transfer tokens to user
        Token(_token).transfer(msg.sender, _amount); //Doubt solved thanks to David.
        
        //Update user balance
        tokens[_token][msg.sender] -= _amount; 

        //Emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }

    //Check Balances
    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    //----------------------
    // MAKE & CANCEL ORDERS

    function makeOrder(
        address _tokenGet, 
        uint256 _amountGet, 
        address _tokenGive, 
        uint256 _amountGive
    ) public {
        //Require token balance
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
        //CREATE ORDER
        ordersCount += 1;
        orders[ordersCount] = _Order(
            ordersCount, 
            msg.sender, //user '0x0...abc123'
            _tokenGet, //tokenGet
            _amountGet, //Amount of token that will be bought
            _tokenGive, //token that will be given
            _amountGive, //Amount of token that will be given
            block.timestamp //timestamp
            );

        //Emit event
        emit Order(
            ordersCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }

}