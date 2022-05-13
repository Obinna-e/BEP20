// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Ownable.sol";

contract DevToken is Ownable{

  uint private _totalSupply;
  uint8 private _decimals;
  string private _symbol;
  string private _name;

  mapping (address => uint256) private _balances;

  event Transfer(address indexed from, address indexed to, uint256 value);
  
  constructor(string memory token_name, string memory short_symbol, uint8 token_decimals, uint256 token_TotalSupply) {
    _name = token_name;
    _symbol = short_symbol;
    _decimals = token_decimals;
    _totalSupply = token_TotalSupply;

    _balances[msg.sender] = _totalSupply;

    emit Transfer(address(0), msg.sender, _totalSupply);

  }

  /**
  *@notice decimals will return the number of decimal precision the Token is deployed with
   */
  function decimals() external view returns (uint8) {
    return _decimals;
  }

  /**
  * @notice symbol will return the Token's symbol
   */

  function symbol() external view returns (string memory){
    return _symbol;
  }

  /**
  * @notice name will return the Token's name
   */

  function name() external view returns (string memory){
    return _name;
  }

  /**
  * @notice totalSupply will return the tokens total supply of tokens 
  */
  function totalSupply() external view returns (uint256) {
    return _totalSupply;
  }

  /**
  * @notice balanceOf will return the account balance for the given account
  */

  function balanceOf(address account) external view returns (uint256) {
    return _balances[account];
  }

  function _mint(address account, uint256 amount) internal {
    require(account != address(0), "DevToken: cannot mint to zero address");

    //Increase total supply
    _totalSupply = _totalSupply + amount;
    // Add amount to the amount balance using the balance mapping
    _balances[account] = _balances[account] + amount;
    //Emit out event to log the action
    emit Transfer(address(0), account, amount);

  }

  /**
  * @notice _burn will destroy tokens from an address inputted and then decrease total supply
  * Requires 
  * - Account cannot be zero
  * - Account balance has to be bigger or equal to amount
  */

  function _burn(address account, uint256 amount) internal {
    require(account != address(0), "DevToken: cannot be burn from zero address");
    require(_balances[account] >= amount, "DevToken: Cannot burn more than the account owns");

    //Remove the amount from the account balance
    _balances[account] = _balances[account] - amount;
    //Decrease totalSupply
    _totalSupply = _totalSupply - amount;
    //Emit event, use zero address as receiver
    emit Transfer(account, address(0), amount);
  }

  /**
  * @notice burn is used to destroy tokens on an address
  * 
  * See {_burn}
  * Requires
  * -msg.sendr must be the token owner
  *
   */

   function burn(address account, uint256 amount) public onlyOwner returns(bool) {
     _burn(account, amount);
     return true;

   }

  function mint(address account, uint256 amount) public onlyOwner returns(bool) {
    _mint(account, amount);
    return true;
  }


   /**
  * @notice transfer is used to transfer funds from the sender to the recipient
  * This function is only callable from outside the contract. For internal usage see 
  * _transfer
  *
  * Requires
  * - Caller cannot be zero
  * - Caller must have a balance = or bigger than amount
  *
   */

  function transfer(address recipient, uint256 amount) external returns (bool) {
    _transfer(msg.sender, recipient, amount);
    return true;
}
/**
* @notice _transfer is used for internal transfers
* 
* Events
* -Transfer 
* 
* Requires 
* - Sender cannot be zero
* - recipient cannot be zero 
* - sender balance most be = or bigger than amount
*/

function _transfer(address sender, address recipient, uint256 amount) internal {
  require(sender != address(0), "DevToken: transfer from zero address");
  require(recipient != address(0), "DevToken: transfer to zero address");
  require(_balances[sender] >= amount, "DevToken: cant transfer more than your account holds");

  _balances[sender] = _balances[sender] - amount;
  _balances[recipient] = _balances[recipient] + amount;

  emit Transfer(sender, recipient, amount);
 }

 /**
 * @notice _allowances is used to manage and control allowance
 * An allowance is the right to use another accounts balance, or part of it
  */

  mapping (address => mapping (address => uint256)) private _allowances;

  /**
  * @notice Approval is emitted when a new Spender is approved to spend Tokens on 
  * the Owners account
   */

   event Approval(address indexed owner, address indexed spender, uint256 value);

   /** 
   * @notice getOwner just calls Ownables owner function.
   * returns owner od the token
   *
    */
    function getOwner() external view returns (address) {
      return owner();
    }

    /**
    * @notice allowance is used view how much allowance a spender has
     */
     function allowance(address owner, address spender) external view returns(uint256) {
       return _allowances[owner][spender];
     }

    /**
    * @notice approve will use the senders address and allow the spender to use X amountof tokens on his behalf
     */
     function approve(address spender, uint256 amount) external returns (bool) {
       _approve(msg.sender, spender, amount);
       return true;
     }

     /**
     * @notice _approve is used to add a new Spender to an Owners account
     * 
     * Events 
     * - {Approval}
     *
     * Requires
     * - owner and spender cannot be zero address
      */
      function _approve(address owner, address spender, uint256 amount) internal {
        require( owner != address(0), "DevToken: apprive cannot be done from zero address" );
        require(spender != address(0), "DevToken: approve cannot be done to zero address");
        //Set the allowance of the spender address at the Owner mapping over accounts to the amount
        _allowances[owner][spender] = amount;

        emit Approval(owner, spender, amount);
      }

      /**
      * @notice transferFrom is used to transfer Tokens from an Accounts allowance
      * Spender address should be the token holder
      * 
      * Requires
      * - The caller must have an allowance = or bigger than the amount spending
       */
       function transferFrom(address spender, address recipient, uint256 amount) external returns(bool) {
         //Make sure spender is allowed the amount
         require(_allowances[spender][msg.sender] >= amount, "DevToken: You cannot spend that much on this account");
         //Transfer first
         _transfer(spender, recipient, amount);
         //Reduce current allowance so a user cannot respend
         _approve(spender, msg.sender, _allowances[spender][msg.sender] - amount);
         return true;
       }
      /**
      *@notice increaseAllowance
      *Adds allowance to an account from the function caller address
      */
      function increaseAllowance(address spender, uint256 amount) public returns (bool){
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + amount);
        return true;
      }

      /**
      * @notice decreaseAllowance
      *Decrease the allowance on the account inputted from the caller address
       */
       function decreaseAllowance(address spender, uint256 amount) public returns (bool) {
         _approve(msg.sender, spender, _allowances[msg.sender][spender] - amount);
         return true;
       }

       







 

  



}
