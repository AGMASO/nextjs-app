import Head from "next/head";
//Como podemos enseñar los NFTs listados en nuestro index.js
//Vamos a recopilar los Enventos triggered en una dataBase y de alli, llamaremos a esa data a nuestro Indx.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MongoClient } from "mongodb";
import { abi, contractAddress } from "../constants/index";

//----------------------------
import connectMongo from "../utils/connectMongo";
import ActiveNft from "../models/ActiveNft";
import ListedNft from "../models/ListedNft";

export default function Home({ ActiveNfts }) {
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
        <div>
          <div className="">
            <h1 className="py-10 px-4 font-extralight text-5xl text-white">
              Welcome to the real decentralized Nfts Market
            </h1>
          </div>
          <div>
            {ActiveNfts.map((ActiveNft) => (
              <a href="https://google.com" key={ActiveNft._id}>
                <h2>{ActiveNft.tokenId}</h2>
                <h2>{ActiveNft.nftAddress}</h2>
                <h2>{ActiveNft.data.event}</h2>
              </a>
            ))}
          </div>
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

  const contractAddress = "0xDD8b8197779524BC4f6C4f258603959CB30544d2";
  const contractAbi = abi;
  const contract = new ethers.Contract(contractAddress, contractAbi, provider);
  // Listen to the event ItemListing emitted by the Solidity contract

  contract.once(
    "ItemListing",
    async (seller, nftAddress, tokenId, price, event) => {
      const ActiveNft = {
        seller: seller,
        nftAddress: nftAddress,
        tokenId: tokenId.toString(),
        price: ethers.utils.formatEther(price),
        data: event,
      };

      //console.log(JSON.stringify(ActiveNft));

      //Connect to MongoDb

      const client = await MongoClient.connect(process.env.MONGODB_KEY);

      //Iniciamos la database conectada al cliente.
      const dataBase = client.db();

      console.log("You are conected to the dataBase");

      // Store the transaction in MongoDB

      const collection = await dataBase.collection("listednfts");

      if (
        (await collection.countDocuments({
          tokenId: ActiveNft.tokenId,
          added_at: { $exists: true },
        })) === 0
      ) {
        try {
          await collection.insertOne(ActiveNft, function (error, result) {
            return result;
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("Document already exits in the Database");
      }
      /*try {
        await collection.insertOne(ActiveNft, function (error, result) {
          return result;
        });
      } catch (error) {
        console.log(error);
      }*/

      const collection2 = dataBase.collection("activenfts");
      if (
        (await collection2.countDocuments({
          tokenId: ActiveNft.tokenId,
          added_at: { $exists: true },
        })) === 0
      ) {
        try {
          await collection2.insertOne(ActiveNft, function (error, result) {
            return result;
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("Document already exits in the Database");
      }

      /*try {
        await collection2.insertOne(ActiveNft, function (error, result) {
          return result;
        });
      } catch (error) {
        console.log(error);
      }*/
      /*await collection2.insertOne(ActiveNft, function (error, result) {
        if (error) {
          console.error(error);
        } else {
          console.log(`NftList stored in MongoDB: ${result2}`);
          //Closing DB
        }
        client.close();
      });*/
    }
  );
  //END

  // LIsten to ItenBought Event

  contract.once("ItemBought", async (buyer, nftAddress, tokenId, price) => {
    const nft = {
      buyer: buyer,
      nftAddress: nftAddress,
      tokenId: tokenId.toString(),
      price: ethers.utils.formatEther(price),
    };

    console.log(JSON.stringify(nft));

    //Connect to MongoDb

    const client = await MongoClient.connect(process.env.MONGODB_KEY);

    //Iniciamos la database conectada al cliente.
    const dataBase = client.db();

    console.log("You are coneccted to the dataBase");

    // Store the transaction in MongoDB
    const collection = dataBase.collection("boughtNfts");
    await collection.insertOne(nft, function (error, result) {
      if (error) {
        console.error(error);
      } else {
        console.log(`NftList stored in MongoDB: ${nft}`);
        //Closing DB
        client.close();
      }
    });

    const collection2 = dataBase.collection("activenfts");
    await collection2.findOneAndDelete(
      { tokenId: nft.tokenId },
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          console.log(`Nft deslistado from Database: ${nft}`);
          //Closing DB
          client.close();
        }
      }
    );
    return nft;
  });

  //END

  //Listen to ItemCanceled

  contract.once("ItemCanceled", async (seller, nftAddress, tokenId) => {
    const nft = {
      seller: seller,
      nftAddress: nftAddress,
      tokenId: tokenId.toString(),
    };

    console.log(JSON.stringify(nft));

    //Connect to MongoDb

    const client = await MongoClient.connect(process.env.MONGODB_KEY);

    //Iniciamos la database conectada al cliente.
    const dataBase = client.db();

    console.log("You are coneccted to the dataBase");

    // Store the transaction in MongoDB

    const collection = dataBase.collection("cancelledNfts");
    collection.insertOne(nft, function (error, result) {
      if (error) {
        console.error(error);
      } else {
        console.log(`CancelledNft stored in MongoDB: ${nft}`);
        //Closing DB
        client.close();
      }
    });

    const collection2 = dataBase.collection("activenfts");

    collection2.findOneAndDelete(
      { tokenId: nft.tokenId },
      function (error, result) {
        if (error) {
          console.error(error);
        } else {
          console.log(`Nft deslistado from Database: ${nft}`);
          //Closing DB
          client.close();
        }
      }
    );
    return nft;
  });
  //END

  //Connect to MongoDb

  try {
    console.log("CONNECTING TO MONGO");

    await connectMongo();

    console.log("CONNECTED TO MONGO");

    console.log("FETCHING DATA");

    const ActiveNfts = await ActiveNft.find();

    console.log("FETCHED DATA");

    return {
      props: {
        ActiveNfts: JSON.parse(JSON.stringify(ActiveNfts)),
      },
    };
  } catch (error) {
    console.log(error);

    return {
      notFound: true,
    };
  }
}
