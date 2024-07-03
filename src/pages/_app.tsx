import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { SnackbarProvider } from "notistack";
import Head from "next/head";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import "~/styles/prosemirror.css";
import { ThemeProvider } from "~/components/novel/themeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SnackbarProvider>
          <main className={inter.className}>
            <div
              className={"h-screen bg-background pt-16 font-sans antialiased"}
            >
              {!router.pathname.includes("/protected") && <Navbar />}
              {children}
            </div>
          </main>
        </SnackbarProvider>
      </ThemeProvider>
    </ClerkProvider>
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
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
};

export default api.withTRPC(MyApp);
