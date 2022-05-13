const { assert } = require("chai");

const Ownable = artifacts.require("DevToken");

//Start a test series named Ownable, it will use 10 test accoounts
contract("Ownable", async accounts => {
    
    it("transfer ownership", async () => {
        ownable = await Ownable.deployed();
        let owner = await ownable.owner();

        //Make sure account 0 is owner
        assert.equal(owner, accounts[0], "The owner was not properly assigned");

        //Transfer it to accounts 1
        await ownable.transferOwnership(accounts[1]);

        //Verify that accounts 1 is now the new owner
        let new_owner = await ownable.owner();

        assert.equal(new_owner, accounts[1], "The ownership was not transferred correctly");
    });

    it("renounce ownership", async () => {
        ownable = await Ownable.deployed();

        //renounce from accounts 1 as it is the new owner
        await ownable.renounceOwnership({ from: accounts[1]});

        let owner = await ownable.owner();

        assert.equal(owner, '0x0000000000000000000000000000000000000000', 'Renouncing owner was not correctly done')
    });
});