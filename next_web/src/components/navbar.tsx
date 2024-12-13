'use client';
import { useContract } from "@/context/contract-context";
import { useState } from "react";
import CreateChracaterBox from "./create-character-box";

const links = [
  { href: "/", text: "Home" },
  { href: "/all-nfts", text: "All NFTs" },
];

const Navbar = (): React.JSX.Element => {
  const { accounts, connectWallet } = useContract();
  const [creatingCharacter, setCreatingCharacter] = useState<boolean>(false);
  return (
    <>

      {creatingCharacter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => { setCreatingCharacter(false); }}
        ></div>
      )}

      <nav className="flex justify-between items-center p-8 text-xl">
        <div className="flex items-end gap-4">
          <h1 className="text-4xl font-bold">CNMB</h1>
          <ul className="flex gap-4">
            {links.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="hover:text-blue-500">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {accounts.length > 0 ? (
            <div className="flex items-end gap-4">
              <button
                className="prone text-center tooltip tooltip-bottom inline-flex items-center"
                onClick={() => { setCreatingCharacter(true); }}
              >
                Upload Character
              </button>
              <CreateChracaterBox
                display={creatingCharacter}
                callback={() => {
                  setCreatingCharacter(false);
                }}
              />
              <p className="text-sm">{accounts[0]}</p>
            </div>
          ) : (
            <button
              className="prone text-center tooltip tooltip-bottom inline-flex items-center"
              onClick={() => {
                if (connectWallet) connectWallet().then().catch();
                else console.error("connectWallet is not defined.");
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
