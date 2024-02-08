import Link from "next/link";
import { useRouter } from "next/router";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const router = useRouter();
  const isHome = () => router.pathname === "/";
  const isActive = (href: string) => router.pathname.includes(href);
  return (
    <nav className="bg-surface-100 text-dark-text-500 flex items-center justify-between px-6 py-4 shadow-lg">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex cursor-pointer items-center">
            <span className="text-primary-600 text-xl font-bold">
              Notion Vault
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-8 text-lg">
        <Link href="/">
          <div
            className={`hover:text-primary-500 flex cursor-pointer items-center transition-colors duration-200 ease-in-out ${isHome() ? "border-primary-500 border-b-2" : ""}`}
          >
            Home
          </div>
        </Link>
        <Link href="/settings">
          <div
            className={`hover:text-primary-500 flex cursor-pointer items-center transition-colors duration-200 ease-in-out ${isActive("/settings") ? "border-primary-500 border-b-2" : ""}`}
          >
            Settings
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
