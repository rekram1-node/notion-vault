import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "~/components/novel/themeToggle";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="shadow-l fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b-2 bg-background px-6 py-4">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex cursor-pointer items-center">
            <Image
              src={"/favicon.ico"}
              width={40}
              height={40}
              alt="notion vault logo"
            />
            <span className="text-2xl font-extrabold">Notion Vault</span>
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-5">
        <ThemeToggle />
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
