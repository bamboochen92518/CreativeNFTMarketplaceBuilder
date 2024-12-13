import type { Metadata } from "next";
import { ContractContextProvider } from "@/context/contract-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | CNMB',
    default: 'CNMB',
  },
  description: 'Creative NFT Marketplace Builder.',
};

const RootLayout = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  return (
    <html lang="en">
      <body className="text-[#d4d2d5] bg-[#1c1c29] flex flex-col min-h-screen">
        <ContractContextProvider>
          <div className="flex-grow flex justify-center items-center">
            {children}
          </div>
        </ContractContextProvider>
      </body>
    </html>
  );
};

export default RootLayout;
