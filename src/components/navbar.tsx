import { HomeIcon, GearIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between bg-gray-800 text-white p-4 shadow-lg">
      <div className="flex items-center">
        <Link href="/" passHref>
          <div className="flex items-center cursor-pointer">
            {/* <Image src="/path-to-your-logo.png" alt="Logo" width={40} height={40} /> */}
            <span className="ml-2 text-xl font-bold">Notion Vault</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-10">
        <Link href="/" passHref>
          <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition duration-200 ease-in-out">
            <HomeIcon  />
            <span>Home</span>
          </div>
        </Link>
        <Link href="/settings" passHref>
          <div className="flex items-center gap-1 hover:text-gray-200 cursor-pointer transition duration-200 ease-in-out">
            <GearIcon />
            <span>Settings</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center">
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
