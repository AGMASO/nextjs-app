import Head from "next/head";
//Como podemos enseñar los NFTs listados en nuestro index.js
//Vamos a recopilar los Enventos triggered en una dataBase y de alli, llamaremos a esa data a nuestro Indx.js

import { ethers } from "ethers";

import { abi, contractAddress } from "../constants/index";

//----------------------------
import connectMongo from "../utils/connectMongo";
import ActiveNft from "../models/ActiveNft";
import ListedNft from "../models/ListedNft";
import listener from "@/listener";

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
  //Connect to MongoDb
  try {
    console.log("Listening");
    await listener();
  } catch (error) {
    console.log(error);
  }
  try {
    console.log("CONNECTING TO MONGO");

    await connectMongo();

    console.log("CONNECTED TO MONGO");

    console.log("FETCHING DATA");

    const activeNfts = await ActiveNft.find();

    console.log("FETCHED DATA");

    return {
      props: {
        ActiveNfts: JSON.parse(JSON.stringify(activeNfts)),
      },
    };
  } catch (error) {
    console.log(error);

    return {
      notFound: true,
    };
  }
}
