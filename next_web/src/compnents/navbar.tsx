'use client';
import { useContract } from "@/context/contract-context";

const links = [
  { href: "/", text: "Home" },
];

const Navbar = (): React.JSX.Element => {
  const { address, connectWallet } = useContract();
  return (
    <nav className="flex justify-between items-center p-8">
      <div className="flex items-end gap-4">
        <h1 className="text-2xl">CNMB</h1>
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
        {address ? (
          <p className="text-sm">Address: {address}</p>
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
  );
};

export default Navbar;
