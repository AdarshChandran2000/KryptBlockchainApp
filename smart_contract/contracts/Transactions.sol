// SPDX-License-Identifier: UNLICENSED


// for choosing the version of solidity we want to use
pragma solidity ^0.8.0;


//  contract is similar to class in programming langauges
contract Transactions {

    // variable
    uint256 transactionCount;

    // like a function we will call later with various parameters
    event Transfer(address from, address receiever, uint amount, string message, uint256 timestamp, string keyword); 

    // making a structure to store the data
    struct TransferStruct {
        address sender;
        address receiever;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    // array of struct TransferStruct  (like a list of objects)
    TransferStruct[] transactions;

    
    // this function doesn't return anything, as it just does some action
    // payble address with name reciever, message stored in memory of transaction (not neccessary unlike prev 2)
    function addToBlockchain(address payable receiver, uint amount, string memory message, string memory keyword) public {
        // increment the counter
        transactionCount += 1;

        // push the transaction to the array
        // you will get an object msg for any function call in the blockchain (msg.sender)
        // block is also generated
        transactions.push(TransferStruct(msg.sender, receiver, amount, message, block.timestamp, keyword));

        // we haven't made the transfer yet. we ll have to emit the event 
        emit Transfer(msg.sender, receiver, amount, message, block.timestamp, keyword);
    }

    // this function returns an array of TransferStruct
    function getAllTransactions() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    // this function returns count of type uint256
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;   
    }


}