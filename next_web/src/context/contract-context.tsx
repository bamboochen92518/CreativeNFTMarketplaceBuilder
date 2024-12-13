'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from "ethers";
import { AVALANCHE_TESTNET_PARAMS } from '@/lib/consts';

type ContractContextType = {
  provider?: ethers.BrowserProvider,
  signer?: ethers.Signer,
  contract?: ethers.Contract,
  accounts: string[],
  address: string,
  abi: string,
  connectWallet?: () => Promise<void>
};

const ContractContext = createContext<ContractContextType>({
  provider: undefined,
  signer: undefined,
  contract: undefined,
  accounts: [],
  address: '',
  abi: '',
  connectWallet: undefined
});

export const ContractContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>(undefined);
  const [signer, setSigner] = useState<ethers.Signer | undefined>(undefined);
  const [contract, setContract] = useState<ethers.Contract | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [address, setAddress] = useState<string>('');
  const [abi, setAbi] = useState<string>('');

  useEffect(() => {
    fetch('/contract.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(contractDetail => {
        setAddress(contractDetail.address);
        setAbi(contractDetail.abi);
      })
      .catch(error => console.error('Error loading JSON:', error));
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      console.log("MetaMask is not installed.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [AVALANCHE_TESTNET_PARAMS]
      });
      const walletAddress = accounts[0];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(address, abi, signer);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccounts(accounts);
      console.log("Successfully Connected", walletAddress);
    } catch (error) {
      console.error("Connection Failed", error);
    }
  };

  return (
    <ContractContext.Provider value={{ provider, signer, contract, accounts, address, abi, connectWallet }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractContextProvider');
  }
  return context;
}
