import React from 'react';
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
import WalletConnectButtonWithModal from "./connect";

const WalletComponent = observer(() => {
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
                <WalletConnectButtonWithModal />
            </WalletProvider>
        </ConnectionProvider>
    )
})


export default WalletComponent;