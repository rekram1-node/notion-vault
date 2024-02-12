import Link from "next/link";
// import { useRouter } from "next/router";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  // const router = useRouter();
  // const isHome = () => router.pathname === "/";
  // const isActive = (href: string) => router.pathname.includes(href);
  return (
    <nav className="shadow-l fixed top-0 z-50 flex w-full items-center justify-between bg-surface-100 px-6 py-4 text-dark-text-500">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex cursor-pointer items-center">
            <span className="text-2xl font-extrabold text-primary-600">
              Notion Vault
            </span>
          </div>
        </Link>
      </div>

      {/* <div className="flex items-center gap-8 text-lg">
        <Link href="/">
          <div
            className={`flex cursor-pointer items-center transition-colors duration-200 ease-in-out hover:text-primary-500 ${isHome() ? "border-b-2 border-primary-500" : ""}`}
          >
            Home
          </div>
        </Link>
        <Link href="/settings">
          <div
            className={`flex cursor-pointer items-center transition-colors duration-200 ease-in-out hover:text-primary-500 ${isActive("/settings") ? "border-b-2 border-primary-500" : ""}`}
          >
            Settings
          </div>
        </Link>
      </div> */}

      <div className="flex items-center">
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
