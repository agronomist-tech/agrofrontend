import { Connection, PublicKey } from '@solana/web3.js';
import {
    BN
} from '@project-serum/anchor'
import {message} from "antd";

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


const waitTxFinish = (tx: string, connection: Connection) => {
    const key = "loadmessage";
    message.loading({content: `Wait transaction: ${tx}`, key: key}, 0);

    setTimeout(function w () {
        connection.getTransaction(tx).then((result)=>{
            if (result === null){
                setTimeout(w, 5000);
            } else if (result.meta && result.meta.err === null) {
                message.success({content: `Transaction finished`, key: key}, 5)
            } else if (result.meta && result.meta.err) {
                message.error({content: `Transaction ${tx} failed`, key: key}, 5)
            }
        })

    }, 5000)
}


export {getNFTsInWallet, convertLamports, waitTxFinish}