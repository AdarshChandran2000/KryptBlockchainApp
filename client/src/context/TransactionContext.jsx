import  React , { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from "../utils/constants";

// creating a react context
export const TransactionContext = React.createContext();


// this was only possible because of linking it with metamask, we are getting ethereum object
// we are destructuring ethereum object from window.ethereum
const { ethereum } = window;

// special function to fetch our Ethereum Contract
const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;
}

// this is the provider for the context
// every contextprovider has to get a prop (children) and has to return something (in most cases, its the transaction provider) 
export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [ formData, setFormData ] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([])

    // all handle changes that interact with input handles an event (e)
    // it will dynamically change to update the form data
    const handleChange = (e, name) => {

        // when we update new state with old state, we have to provide a callback function which has prevState as a parameter
        // advanced react knowledge for that e.target.value
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    const getAllTransactions = async  () => {
        try {
            if(!ethereum) alert("Please install metamask");

            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();
            
            // there is typo in receiver spelling in transaction.sol
            const structuredTransactions = availableTransactions.map((transaction) => ({ 
                addressTo: transaction.receiever,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));

            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () => {

        try {
            if(!ethereum) {
                return alert("Please install Metamask!!!");
            }
    
            const accounts = await ethereum.request({ method: 'eth_accounts' });
    
            if(accounts.length) {
                setCurrentAccount(accounts[0]);    
                getAllTransactions();
            } else {
                console.log('No accounts found!!');
            }
        }
        catch (error) {
            console.log(error);
            throw new Error("No ethereum object!!");
        }

    }

    const checkIfTransactionsExist = async () => {
        try {
            const  transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();
            
            window.localStorage.setItem('transactionCount', transactionCount);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object!!");
        }
    }

    const connectWallet =  async () => {
        try {
            if(!ethereum) {
                return alert("Please install Metamask!!!");
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

            setCurrentAccount(accounts[0]);

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object!!");
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) {
                return alert("Please install Metamask!!!");
            }

            // get the data from the form
            const { addressTo, amount, keyword, message } = formData;
            const  transactionContract = getEthereumContract();

            // parses decimal amount into gwei amount
            const parsedAmount = ethers.utils.parseEther(amount);
            // gas fees written in hexadecimal.
            // 0x5208 equals to 21000 Gwei (smaller unit of ether (0.000021))
            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: "0x5208", // 21000 Gwei
                    value: parsedAmount._hex, // ._hex to convert to gwei. 

                }]
            });

            // to store transaction to blockchain and returns a unique transaction hash 
            const transactionHash =  await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());

        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);


    // inside value={{ connectWallet : connectWallet}} (since the value is same, you can do like below)
    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>

    )
}