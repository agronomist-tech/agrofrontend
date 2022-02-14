import React, {useEffect, useState} from 'react';
import {useMemo} from "react";
import {observer} from "mobx-react-lite";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {Modal, Menu, Button, Space, Tooltip} from "antd";
import {PublicKey} from "@solana/web3.js";
import {ReactComponent as Logo} from '../../assets/images/logo.svg';
import {useStore} from "../../utils/hooks";
import {AGTE_MINT} from "../../utils/consts";


interface WalletsModalInterface {
    visible: boolean
    // onSelect: (walletName: string) => void
    onClose: () => void
}


const WalletsModal = ({visible, onClose}: WalletsModalInterface) => {
    const {select, wallets} = useWallet();

    const walletsMenu = useMemo(() => {
        return wallets.map((w) => {
            return <Menu.Item key={w.name}
                              onClick={() => {
                                  select(w.name);
                                  onClose();
                              }}>
                {w.name} <img alt="logo" style={{float: "right", height: "30px", paddingTop: "4px"}} src={w.icon}/>
            </Menu.Item>
        })
    }, [wallets, onClose, select])

    return <Modal
        title="Connect wallet"
        visible={visible}
        footer={null}
        onCancel={() => {
            onClose()
        }}
        width={330}
    >
        <Menu>
            {walletsMenu}
        </Menu>
    </Modal>
}


const TokenCount = observer(() => {
    const store = useStore();
    const {connection} = useConnection();
    const {wallet, publicKey, connected} = useWallet();
    const [agteBalance, setAgteBalance] = useState(0.)

    useEffect(() => {
        if (publicKey && connected) {
            connection.getParsedTokenAccountsByOwner(publicKey, {mint: new PublicKey(AGTE_MINT)})
                .then((data) => {
                    if (data.value.length > 0) {
                        const amount = data.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                        setAgteBalance(amount);
                        store.setAgteAmount(amount);
                    }
                })
                .catch((reason)=>{
                    console.error(reason)
                })
        }
    }, [connected, wallet, connection, publicKey])

    return (
        <Tooltip placement="bottom" title="AGTE Tokens">
            <div className="agte-amount">
                <Logo style={{width: "24px"}}/> <span>{agteBalance.toFixed(2)}</span>
            </div>
        </Tooltip>
    )
})


const WalletConnectButtonWithModal = observer(() => {
    const [modalOpen, setModalOpen] = useState(false);
    const {wallet, publicKey, connecting, connected, connect} = useWallet();
    const [walletText, setWalletText] = useState("")

    useEffect(() => {
        if (wallet) {
            connect().catch((err) => {
                console.log(err)
            });
        }
    }, [wallet, connect])

    useEffect(() => {
        if (connecting) {
            setWalletText("Connecting...")
        } else if (connected && publicKey) {
            const key = publicKey.toBase58()
            setWalletText(`${key.slice(0, 4)}...${key.slice(-4)}`)
        }
    }, [connected, connecting, publicKey])

    return (
        <>
            {wallet ?
                <>
                    <Space>
                        <TokenCount/>
                        <Button type={"primary"}>{walletText}</Button>
                    </Space>
                </> :
                <>
                    <WalletsModal visible={modalOpen} onClose={() => setModalOpen(false)}/>
                    <Button type={"primary"} block onClick={() => setModalOpen(true)}>
                        Connect wallet
                    </Button>
                </>
            }

        </>
    )
})


export default WalletConnectButtonWithModal;