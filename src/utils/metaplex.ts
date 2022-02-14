import { PublicKey, Connection } from '@solana/web3.js';
import { programs } from '@metaplex/js';
import {Buffer} from "buffer";

const metadataSeed = Buffer.from("metadata");
const metaplexProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");


const getNFTMetadata = async (connection: Connection, address: PublicKey | string) => {
    let mint

    if (typeof address === 'string'){
        mint = new PublicKey(address)
    } else {
        mint = address
    }
    try {
        const pdaAddress = await PublicKey.findProgramAddress(
            [metadataSeed, metaplexProgramId.toBuffer(), mint.toBuffer()],
            metaplexProgramId)
        return await programs.metadata.Metadata.load(connection, pdaAddress[0]);
    } catch (e) {
        console.warn('Failed to fetch metadata ', e);
        throw e
  }
}


const getOurNFT = (mints: string[], users: string[]): string[] => {
    return users.filter((t) => mints.includes(t))
}


export {getNFTMetadata, getOurNFT};