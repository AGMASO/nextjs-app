import Head from "next/head";
//Como podemos enseñar los NFTs listados en nuestro index.js
//Vamos a recopilar los Enventos triggered en una dataBase y de alli, llamaremos a esa data a nuestro Indx.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MongoClient } from "mongodb";
import { abi, contractAddress } from "../constants/index";

export default function Home(props) {
  return (
    <>
      <Head>
        <title>Nft Marketplace</title>
        <meta
          name="description"
          content="List your Nfts, sell it or buy more"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="" />
      </Head>

      <main className="flex justify-center">
        <div className="">
          <h1 className="py-10 px-4 font-extralight text-5xl text-white">
            Welcome to the real decentralized Nfts Market
          </h1>
        </div>
      </main>
    </>
  );
}

export async function getStaticProps() {
  //Intento de oir eventos de nuestro contrato y subirlo a la mongoDb
  //Connecting to Ethereum Goerli Network

  const provider = new ethers.providers.WebSocketProvider(
    process.env.GOERLI_RPC_URL
  );

  const contractAddress = "0x5b8081DBa963EECC87416EE82256762a9984f43d";
  const contractAbi = abi;
  const contract = new ethers.Contract(contractAddress, contractAbi, provider);
  // Listen to the event emitted by the Solidity contract

  contract.on(
    "ItemListing",
    async (seller, nftAddress, tokenId, price, event) => {
      const nft = {
        seller: seller,
        nftAddress: nftAddress,
        tokenId: tokenId.toString(),
        price: ethers.utils.formatEther(price),
        data: event,
      };

      console.log(JSON.stringify(nft));

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
          console.log(`NftList stored in MongoDB: ${nft}`);
          //Closing DB
          client.close();
        }
      });
      return nft;
    }
  );

  return {
    props: {
      /*
      nftsDummy: nfts.map((nft) => ({
        id: nft._id.toString(),
        Owner: nft.seller,
        address: nft.nftAddress,
        price: nft.price,
      })),
    */
    },
  };
}
