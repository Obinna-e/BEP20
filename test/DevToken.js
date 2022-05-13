// it("name of test", async accounts => {out test logic})

const { assert } = require("chai");



const DevToken = artifacts.require("DevToken");


// Start a test series named DevToken, it will use 10 test accounts 
contract("DevToken", async accounts => {
    // each it is a new test, and we name our first test initial supply
    it("initial supply", async () => {
        // wait until devtoken is deplyoed, store the results inside devToken
        // the result is a client to the Smart contract api
        devToken = await DevToken.deployed();
        // call our totalSupply function
        let supply = await devToken.totalSupply()

        // Assert that the supply matches what we set in migration
        assert.equal(supply.toNumber(), 5000000, "Initial supply was not the same as in migration")
        
    });

    it("minting", async() => {
        devToken = await DevToken.deployed();

        //use account 1 because balance is zero
        let initial_balance = await devToken.balanceOf(accounts[1]);

        //verify balance
        assert.equal(initial_balance.toNumber(), 0, "initial balance for account 1 should be 0")

        //mint 100 tokens to the user and grab the balance again
        let totalSupply = await devToken.totalSupply();
        await devToken.mint(accounts[1], 100);
        //Grab balance again to see what it is after calling mint

        let after_balance = await devToken.balanceOf(accounts[1]);
        let after_supply = await devToken.totalSupply();
        //Assert and check that they match
        assert.equal(after_balance.toNumber(), 100, "The balance after minting 100 should be 100")
        assert.equal(after_supply.toNumber(), totalSupply.toNumber() + 100, "The total supply should have increased by 100")

        try {
            //Mint with address 0
            await devToken.mint('0x0000000000000000000000000000000000000000', 100);

        }catch(error){
            assert.equal(error.reason, "DevToken: cannot mint to zero address", "Failed to stop minting on zero address")
        }
    })

    it("burning", async() => {
        devToken = await DevToken.deployed();

        //continue on account one since it now has 100 tokens
        let initial_balance = await devToken.balanceOf(accounts[1]);

        //Burn to address 0
        try{
            await devToken.burn('0x0000000000000000000000000000000000000000', 100);

        }catch(error){
            assert.equal(error.reason, "DevToken: Cannot burn more than the account owns", "Failed to capture too big burns on an account")

        }

        let totalSupply = await devToken.totalSupply();
        try{
            await devToken.burn(accounts[1], initial_balance - 50);

        }catch(error){
            assert.fail(error);
        }

        let balance = await devToken.balanceOf(accounts[1]);

        //Make sure balance was reduced and that total Supply reduced
        assert.equal(balance.toNumber(), initial_balance-50, "Burning 50 should reduce users balance")

        let newSupply = await devToken.totalSupply();
        assert.equal(newSupply.toNumber(), totalSupply.toNumber()-50, "Total supply not properly reduced")
    })

    it("transfering tokens", async() => {
        devToken = await DevToken.deployed();

        // Grab initial balance 
        let initial_balance = await devToken.balanceOf(accounts[1]);

        // transfer tokens from account 0 to 1
        await devToken.transfer(accounts[1], 100);

        let after_balance = await devToken.balanceOf(accounts[1]);

        assert.equal(after_balance.toNumber(), initial_balance.toNumber()+100, "Balance should have increased on receiver")

        //We can change the msg.sender using the FROM value in function calls.
        let account2_initial_balance = await devToken.balanceOf(accounts[2]);

        await devToken.transfer(accounts[2], 20, {from: accounts[1]});

        //Make sure balances are switched on bothe accounts
        let account2_after_balance = await devToken.balanceOf(accounts[2]);
        let account1_after_balance = await devToken.balanceOf(accounts[1]);

        assert.equal(account1_after_balance.toNumber(), after_balance.toNumber()-20, "Should have reduced account 1 balance by 20");
        assert.equal(account2_after_balance.toNumber(), account2_initial_balance.toNumber()+20, "Should have given accounts 2 20 tokens");


        // Try transfering too much 
        try{
            await devToken.tranfer(accounts[2], 2000000000000, { from: accounts[1]});

        }catch(error){
            assert.equal(error.reason, "DevToken: cant transfer more than your account holds");
        }
    })

    it("allow account some allowance", async() => {
        devToken = await DevToken.deployed();

        try{
            //Give account(0) access to 100 tokens on creator
            await devToken.approve('0x0000000000000000000000000000000000000000', 100);
        }catch(error){
            assert.equal(error.reason, 'DevToken: approve cannot be a zero address', "Should be able to approve zero address");
        }

        try{
            //Give account(1) access to 100 tokens on zero account
            await devToken.approve(accounts[1], 100);
        }catch(error){
            assert.fail(error); //should not fail
        }

        //Verify by checking allowance
        let allowance = await devToken.allowance(accounts[0], accounts[1]);

        assert.equal(allowance.toNumber(), 100, "Allowance was noot correctly inserted");
    })

    it("transfering with allowance", async() => {
        devToken = await DevToken.deployed();

        try{
            //Account 1 should have 100 tokens by now to use on account 0
            // lets try using more
            await devToken.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1]});

        } catch(error){
            assert.equal(error.reason, "DevToken: You cannot spend that much on this account", "Failed to detect overspending")
        }

        let init_allowance = await devToken.allowance(accounts[0], accounts[1]);
        console.log("init balance: ", init_allowance.toNumber())

        try{
            //Account 1 should have 100 tokens by now to use on account 0
            //try using more
           let worked =  await devToken.transferFrom(accounts[0], accounts[2], 50, {from: accounts[1]});

        }catch(error){
            assert.fail(error);
        }

        //Make sure allowance was changed 
        let allowance = await devToken.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 50, "The allowance should have been decreased by 50")
    })

});