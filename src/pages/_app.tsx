import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/router";
// import { Theme } from "@radix-ui/themes";
import { SnackbarProvider } from "notistack";
import Head from "next/head";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";

import "~/styles/globals.css";

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <>
      <ClerkProvider>
        <SnackbarProvider>
          {!router.pathname.includes("/encrypted") &&
            !router.pathname.includes("/editor") && <Navbar />}
          <main className="">{children}</main>
        </SnackbarProvider>
      </ClerkProvider>
    </>
  );
}

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Notion Vault</title>
        <meta name="description" content="End to End encrypted content pages" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-primary-radial absolute inset-0 h-full w-full">
        <div className="h-full overflow-auto">
          {/* <Theme> */}
          <Layout>
            <Component {...pageProps} />
          </Layout>
          {/* </Theme> */}
        </div>
      </div>
    </>
  );
};

export default api.withTRPC(MyApp);
