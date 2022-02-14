import React, {ReactNode} from 'react';
import {useMemo} from "react";

import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react';
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';

import {
    getPhantomWallet,
    getSolflareWallet,
    getSolletExtensionWallet,
    getSolletWallet,
} from '@solana/wallet-adapter-wallets';
import {clusterApiUrl} from '@solana/web3.js';

import {observer} from "mobx-react-lite";


interface Props {
    children: ReactNode
}


const WalletWrapper = observer((props: Props) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            getPhantomWallet(),
            getSolletWallet({network}),
            getSolletExtensionWallet({network}),
            getSolflareWallet()
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
                {props.children}
            </WalletProvider>
        </ConnectionProvider>
    )
})


export default WalletWrapper;