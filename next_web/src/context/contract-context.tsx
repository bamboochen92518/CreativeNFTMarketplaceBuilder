import { createContext, useContext, useEffect, useState } from 'react';

type ContractContextType = {
  address: string,
  abi: string
};

const ContractContext = createContext<ContractContextType>({
  address: '',
  abi: ''
})

export const ContractContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const [address, SetAddress] = useState<string>('');
  const [abi, SetAbi] = useState<string>('');

  useEffect(() => {
    fetch('./contract.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(contractDetail => {
        SetAddress(contractDetail.address);
        SetAbi(contractDetail.abi);
      })
      .catch(error => console.error('Error loading JSON:', error));
  }, []);

  return (
    <ContractContext.Provider value={{ address, abi }}>
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = (): ContractContextType => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractContextProvider');
  }
  return context;
}
