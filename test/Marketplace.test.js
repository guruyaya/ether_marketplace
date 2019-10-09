const Marketplace = artifacts.require('./Marketplace.sol')
require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace
  // SUCCESS

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    });

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Test Marketplace')
    });
  });

  let result, productCount, product;
  describe('products', async () => {
    before(async () => {
      result = await marketplace.createProduct("Iphone X", web3.utils.toWei('0.2', 'Ether'), { from:seller });
      productCount = await marketplace.productCount();
      product = marketplace.products[1];
    });

    it('Creates products', async () => {
        // SUCCESS
        const productCount = await marketplace.productCount();
        assert.equal(productCount, 1, 'Product count incresed');
        const event = result.logs[0].args;
        assert.equal(productCount, event.id.toNumber(), 'Id is correct');
        assert.equal("Iphone X", event.name, 'name is correct');
        assert.equal('200000000000000000', event.price, 'price is correct');
        assert.equal(seller, event.owner, 'seller is correct');
        assert.equal(false, event.purchased, 'is_puchased is correct');

        // FAILURE
        // Product must have a _name
        await marketplace.createProduct("", web3.utils.toWei('0.2', 'Ether'), { from:seller }).should.be.rejected;
      // price is set higher than 0
      await marketplace.createProduct("Iphone X", '0', { from:seller }).should.be.rejected;
    });

    it('Lists a Product', async () => {
        const product = await marketplace.products(productCount);
        assert.equal(productCount, product.id.toNumber(), 'Id is correct');
        assert.equal("Iphone X", product.name, 'name is correct');
        assert.equal('200000000000000000', product.price, 'price is correct');
        assert.equal(seller, product.owner, 'seller is correct');
        assert.equal(false, product.purchased, 'is_puchased is correct');
    });

    it('sells a product', async () => {
        // FAILURE: tried buying with the wrong price
        await marketplace.purchaseProduct(1, {
            from: buyer, value: '100000000000000000'
        }).should.be.rejected;
        // FAILURE: tried buying his own product
        await marketplace.purchaseProduct(1, {
            from: seller, value: '200000000000000000'
        }).should.be.rejected;

        // SUCCESS
        // track seller balance, pre sale
        let oldSellerBalance = await web3.eth.getBalance(seller);
        oldSellerBalance = new web3.utils.BN(oldSellerBalance);
        // success
        result =  await marketplace.purchaseProduct(productCount, {
            from: buyer, value: '200000000000000000'
        });
        const event = result.logs[0].args;
        assert.equal(productCount, event.id.toNumber(), 'Id is correct');
        assert.equal("Iphone X", event.name, 'name is correct');
        assert.equal('200000000000000000', event.price, 'price is correct');
        assert.equal(buyer, event.owner, 'buyer is correct');
        assert.equal(true, event.purchased, 'is_puchased is correct');
        // check the seller got his money
        let newSellerBalance = await web3.eth.getBalance(seller);
        newSellerBalance = new web3.utils.BN(newSellerBalance);
        let price = '200000000000000000';
        price = new web3.utils.BN(price);
        const expectedBalance = oldSellerBalance.add(price);
        assert.equal(expectedBalance.toString(), newSellerBalance.toString(), "Seller got his money");

        // FAILURE: make sure product exists
        await marketplace.purchaseProduct(190, {
            from: buyer, value: '200000000000000000'
        }).should.be.rejected;
        // FAILURE: Trying to buy an allready bought product
        await marketplace.purchaseProduct(1, {
            from: deployer, value: '200000000000000000'
        }).should.be.rejected;
    });
  });



});
