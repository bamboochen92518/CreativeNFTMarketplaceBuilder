'use client';
import { useContract } from "@/context/contract-context";

const Page = (): React.JSX.Element => {
  const { connectWallet } = useContract();
  return (
    <button
      className="prone text-center tooltip tooltip-bottom inline-flex items-center"
      onClick={() => { 
        if (connectWallet) connectWallet().then().catch();
        else console.error("connectWallet is not defined.");
      }}
    >
      Connect Wallet
    </button>
  );
}

export default Page;
