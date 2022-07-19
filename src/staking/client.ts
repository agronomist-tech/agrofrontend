import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
import {
    Program,
    Provider,
    BN,
    web3,
} from '@project-serum/anchor'

import idl from './idl.json'
import {AnchorWallet} from "@solana/wallet-adapter-react";
import {AGTE_MINT, PROGRAM_ID} from "../utils/consts";

const agteTokenAddr = new PublicKey(AGTE_MINT);
const programId = new PublicKey(PROGRAM_ID);
const opts = {
    preflightCommitment: "recent",
};


type UserSettings = {
    lastRedeemDate: number
    pendingRedeem: number
    apy: number
    staked: BN
}


class StakingClient {
    connection: Connection
    wallet: AnchorWallet | undefined
    program: Program
    tokenMint: PublicKey

    constructor(connection: Connection, wallet: AnchorWallet | undefined) {
        this.connection = connection
        this.wallet = wallet
        // @ts-ignore
        this.program = new Program(idl, programId, new Provider(this.connection, this.wallet, opts));
        this.tokenMint = new PublicKey(AGTE_MINT);
    }

    async getStakedAmount(): Promise<BN> {
        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)
        // @ts-ignore
        try {
            const res = await this.program.account.stakingSettings.fetch(settingsPDA);
            return new BN(res.stakedAmount / LAMPORTS_PER_SOL);
        } catch {
            return new BN(0);
        }
    }

    async getStakingATA() {
        if (!this.wallet) return {}

        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)
        try {
            return await this.connection.getParsedTokenAccountsByOwner(stakingInfoPDA, {programId: TOKEN_PROGRAM_ID}, 'confirmed');
        } catch (e) {
            return {}
        }
    }

    async userApproved(): Promise<UserSettings | boolean> {
        if (!this.wallet) return false

        let settings: UserSettings = {
            apy: 0,
            lastRedeemDate: 0,
            pendingRedeem: 0,
            staked: new BN('')
        }
        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)
        try {
            const res = await this.program.account.stakeInfo.fetch(stakingInfoPDA);
            settings.apy = res.apy;
            settings.pendingRedeem = parseInt(res.pendingRedeem) / web3.LAMPORTS_PER_SOL;
            settings.lastRedeemDate = res.lastRedeemDate;
        } catch {
            return false;
        }

        const accounts = await this.connection.getTokenAccountsByOwner(stakingInfoPDA, {mint: this.tokenMint})

        if (accounts.value.length === 0) {
            return false
        }

        let balance;
        try {
            balance = await this.connection.getTokenAccountBalance(accounts.value[0].pubkey);
        } catch {
            return false
        }

        settings.staked = new BN(balance.value.amount);

        return settings
    }

    async approveStake(): Promise<string | undefined> {
        if (!this.wallet) return

        const [stakingInfoPDA, stakingInfoPDABump] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)
        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)

        const stakingAccount = await web3.Keypair.generate();

        const stakingTokenAccount = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            agteTokenAddr,
            stakingAccount.publicKey
        )

        const createATAInstruction = Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            agteTokenAddr,
            stakingTokenAccount,
            stakingAccount.publicKey,
            this.wallet.publicKey
        )
        // @ts-ignore
        const tx = await this.program.rpc.stakeInit(
            stakingInfoPDABump,
            {
                preInstructions: [
                    createATAInstruction
                ],
                accounts: {
                    stakingInfo: stakingInfoPDA,
                    stakingAccount: stakingTokenAccount,

                    user: this.wallet.publicKey,
                    stakedUser: stakingAccount.publicKey,
                    settingsAccount: settingsPDA,

                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [stakingAccount],
            });
        return tx
    }

    async stake(amount: number): Promise<string | undefined> {
        if (!this.wallet) return

        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)
        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)

        const info = await this.connection.getTokenAccountsByOwner(stakingInfoPDA, {mint: agteTokenAddr})
        const stakingTokenAccount = info["value"][0].pubkey;

        const tokenFrom = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            agteTokenAddr,
            this.wallet.publicKey
        )

        const tx = await this.program.rpc.stake(
            new BN(amount), {
                accounts: {
                    settingsAccount: settingsPDA,
                    tokenFrom: tokenFrom,

                    stakingInfo: stakingInfoPDA,
                    stakingAccount: stakingTokenAccount,

                    user: this.wallet.publicKey,

                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                }
            });
        return tx
    }

    async unstake() {
        if (!this.wallet) return

        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)
        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)

        const sendTo = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            agteTokenAddr,
            this.wallet.publicKey
        )
        const infos = await this.connection.getTokenAccountsByOwner(stakingInfoPDA, {mint: agteTokenAddr})
        // @ts-ignore
        const sendFrom = infos.value[0].pubkey

        const tx = await this.program.rpc.unstake(
            {
                accounts: {
                    settingsAccount: settingsPDA,
                    tokenFrom: sendFrom,
                    tokenTo: sendTo,
                    stakingInfo: stakingInfoPDA,

                    user: this.wallet.publicKey,

                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
            });
        return tx
    }

    async redeem() {
        if (!this.wallet) return

        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)
        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)

        const infos = await this.connection.getTokenAccountsByOwner(settingsPDA, {mint: agteTokenAddr})
        const agteAccount = infos.value[0].pubkey

        const infos2 = await this.connection.getTokenAccountsByOwner(stakingInfoPDA, {mint: agteTokenAddr})
        const stakingAccount = infos2.value[0].pubkey

        const sendTo = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            agteTokenAddr,
            this.wallet.publicKey
        )

        const tx = await this.program.rpc.redeem(
            {
                accounts: {
                    settingsAccount: settingsPDA,
                    agteAccount: agteAccount,

                    tokenTo: sendTo,
                    stakingInfo: stakingInfoPDA,
                    stakingAccount: stakingAccount,
                    user: this.wallet.publicKey,

                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
            });
        return tx
    }

    async stakeNFT(mint: string) {
        if (!this.wallet) return

        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)
        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)

        const infos = await this.connection.getTokenAccountsByOwner(stakingInfoPDA, {mint: agteTokenAddr})
        const agteAccount = infos.value[0].pubkey

        const stakingAccount = await web3.Keypair.generate();
        const mintKey = new PublicKey(mint);

        const nftTokenAccount = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintKey,
            this.wallet.publicKey
        )

        const stakingTokenAccount = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintKey,
            stakingAccount.publicKey
        )

        const createATAInstruction = Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintKey,
            stakingTokenAccount,
            stakingAccount.publicKey,
            this.wallet.publicKey
        )

        const tx = await this.program.rpc.stakeNft(
            {
                preInstructions: [
                    createATAInstruction
                ],
                accounts: {
                    settingsAccount: settingsPDA,
                    tokenFrom: nftTokenAccount,

                    stakingInfo: stakingInfoPDA,
                    agteAccount: agteAccount,

                    stakingAccount: stakingTokenAccount,

                    user: this.wallet.publicKey,
                    stakedUser: stakingAccount.publicKey,

                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
                signers: [stakingAccount]
            });
        return tx
    }

    async unstakeNFT(mint: string) {
        if (!this.wallet) return

        const [settingsPDA] = await web3.PublicKey.findProgramAddress([Buffer.from("settings")], programId)
        const [stakingInfoPDA] = await web3.PublicKey.findProgramAddress([this.wallet.publicKey.toBuffer(), Buffer.from("agrostaking")], programId)

        const mintKey = new PublicKey(mint);

        const infos = await this.connection.getTokenAccountsByOwner(stakingInfoPDA, {mint: agteTokenAddr})
        const agteAccount = infos.value[0].pubkey

        const infos2 = await this.connection.getParsedTokenAccountsByOwner(stakingInfoPDA, {mint: mintKey})
        let sendFrom: PublicKey | null = null;
        infos2.value.forEach((acc)=>{
            if (acc.account.data.parsed.info.tokenAmount.uiAmount === 1){
                sendFrom = acc.pubkey
            }
        })

        if (!sendFrom) return

        const sendTo = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintKey,
            this.wallet.publicKey
        )
        const tx = await this.program.rpc.unstakeNft(
            {
                accounts: {
                    settingsAccount: settingsPDA,
                    tokenFrom: sendFrom,
                    tokenTo: sendTo,

                    stakingInfo: stakingInfoPDA,
                    agteAccount: agteAccount,

                    user: this.wallet.publicKey,

                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: web3.SystemProgram.programId,
                },
            });
        return tx
    }
}

export type {UserSettings};
export default StakingClient;