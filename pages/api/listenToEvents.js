/*import { ethers } from "ethers";
import { MongoClient } from "mongoDb";
import { abi, contractAddress } from "../constants/index";



async function listenToEvents(req,res) {
    
    
    
    //Connecting to Ethereum Goerli Network

    const provider = new ethers.WebSocketProvider(
      "wss://eth-goerli.g.alchemy.com/v2/6WDKZRPFR3JfUlvLpczZ491-CvXm-jhc"
    );

    const contractAddress = "0x9F8847cA2f42600b869E39A4Dc0Eb618Ed115A4b";
    const contractAbi = abi;
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );
    // Listen to the event emitted by the Solidity contract

    contract.on("ItemListing", (seller, nftAddress, tokenId, price)=> {
      const nft = {
        seller: seller.toLowerCase(),
        nftAddress: nftAddress.toLowerCase(),
        tokenId: tokenId.toString(),
        price: ethers.utils.formatUnits(price, 6),
      };

      console.log(JSON.stringify(nft,null,4));

    //Connect to MongoDb

    const client = await MongoClient.connect(process.env.MONGODB_KEY);

    //Iniciamos la database conectada al cliente.
    const dataBase = client.db();

    console.log("You are coneccted to the dataBase");

    

      // Store the transaction in MongoDB

      const collection = dataBase.collection("nfts");
      collection.insertOne(nft, function (error, result) {
        if (error) {
          console.error(error);
        } else {
          console.log("NftList stored in MongoDB", nft);
        }
      });
      
    });
    res.status(200).json({ message: "Listening to events..." });
  }

  listenToEvents();


  export default listenToEvents;*/
