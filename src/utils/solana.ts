import { Connection, PublicKey } from '@solana/web3.js';
import {
    BN
} from '@project-serum/anchor'

const tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';


const getNFTsInWallet = async (connection: Connection, publicKey: PublicKey): Promise<string[]> => {
    const resp = await connection.getParsedTokenAccountsByOwner(
        publicKey, {programId: new PublicKey(tokenProgram)}
    );

    return resp.value.filter((mint)=>{
        const info = mint.account.data.parsed.info.tokenAmount;
        return (info.amount === '1' && info.decimals === 0)
    }).map((record)=>record.account.data.parsed.info.mint)
}


const convertLamports = (lamports: BN) => lamports.toNumber() / 1000000000;


export {getNFTsInWallet, convertLamports}