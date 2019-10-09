pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping (uint => Product) public products;

    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }
    event ProductCreated (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );
    event ProductPurchsed (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Test Marketplace";
    }

    function createProduct(string memory _name, uint _price) public {
        // make sure product params are correct
        require(bytes(_name).length > 3);
        require(_price > 0);
        // increment productCount
        productCount++;
        // create the product
        products[productCount] = Product(1, _name, _price, msg.sender, false);
        // trigger an event
        emit ProductCreated(1, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        // fetch the product
        Product memory _product = products[_id];
        // fetch the owner
        address payable _seller = _product.owner;
        // make sure product valid
        require(_product.id > 0 && _product.id <= productCount);
        // make sure buyer paid eanogh to buy our stuff
        require(msg.value >= _product.price);
        // product was not bought previously
        require(_product.purchased == false);
        require(msg.sender != _product.owner);
        
        // transfer ownership to the buyer
        _product.owner = msg.sender;
        // set purchased
        _product.purchased = true;
        products[_id] = _product;
        // pay the seller
        address(_seller).transfer(msg.value);
        // trigger an event
        emit ProductPurchsed(1, _product.name, msg.value, msg.sender, true);
    }
}
