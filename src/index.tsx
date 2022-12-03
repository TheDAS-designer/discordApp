import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { Web3Modal } from '@web3modal/react'
import './styles/styles.css'


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


const projectId = "c73771ec4df730b9a5398690ac979cd0"


// 2. Configure wagmi client
const chains = [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum]
const { provider } = configureChains(chains, [walletConnectProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider
})

// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiClient, chains)


root.render(
  <React.StrictMode>
    <BrowserRouter>
    <WagmiConfig client={wagmiClient}>
      <div className={"outer"}>
     
    <App />
    </div>
    </WagmiConfig>
    </BrowserRouter>
    <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
      />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
