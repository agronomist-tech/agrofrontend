import React from 'react';
import {createContext} from "react"
import {BigNumber as BN} from 'bignumber.js';
import './styles/theme.less';
import './styles/global.css';
import './styles/components.css';
import {Layout} from 'antd';
import {observer} from "mobx-react-lite";
import {RootStore} from "./stores";
import rootStore from "./stores"
import {
    QueryClient,
    QueryClientProvider,
} from 'react-query'
import LeftMenu from "./components/menu/leftmenu";
import TopMenu from "./components/menu/topmenu";
import PairsPage from "./pages/pairs";
import ExplorePage from "./pages/nft/explore";
import {HashRouter, Routes, Route} from "react-router-dom";
import WalletWrapper from "./components/wallet";
import StakingPage from "./pages/nft/staking";
import PoolsPage from "./pages/pools";

const queryClient = new QueryClient();

const Store = createContext<RootStore>(rootStore);

const BNFmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: ''
}

BN.config({ FORMAT: BNFmt, DECIMAL_PLACES: 9 })

const App = observer(() => {
    return (
        <>
            <Store.Provider value={rootStore}>
                <WalletWrapper>
                    <QueryClientProvider client={queryClient}>
                        <HashRouter>
                            <Layout style={{height: "100%"}}>
                                <Layout.Sider style={{
                                    overflowX: 'hidden',
                                    height: '100vh',
                                    position: 'fixed',
                                    left: 0,
                                }}>
                                    <LeftMenu/>
                                </Layout.Sider>
                                <Layout style={{marginLeft: 200}}>
                                    <Layout.Header>
                                        <TopMenu/>
                                    </Layout.Header>
                                    <Layout.Content>
                                        <Routes>
                                            <Route path="/" element={<PairsPage/>}/>
                                            <Route path="/pools" element={<PoolsPage/>}/>
                                            <Route path="/nft/explore" element={<ExplorePage/>}/>
                                            <Route path="/nft/staking" element={<StakingPage/>}/>
                                        </Routes>
                                    </Layout.Content>
                                </Layout>
                            </Layout>
                        </HashRouter>
                    </QueryClientProvider>
                </WalletWrapper>
            </Store.Provider>
        </>
    );
})

export default App;
export {Store}