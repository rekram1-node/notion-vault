import { type AppType } from "next/app";
import { Inter as FontSans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { SnackbarProvider } from "notistack";
import Head from "next/head";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";
import { cn } from "~/utils/cn";

import "~/styles/globals.css";
import "~/styles/prosemirror.css";
import { ThemeProvider } from "~/components/novel/themeProvider";

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    //   <body

    // >
    // <body>
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SnackbarProvider>
          {!router.pathname.includes("/encrypted") &&
            !router.pathname.includes("/editor") && <Navbar />}
          <main
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              fontSans.variable,
            )}
          >
            {children}
          </main>
        </SnackbarProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
      {/* <div className="bg-primary-radial absolute inset-0 h-full w-full">
        <div className="h-full overflow-auto"></div>
      </div> */}
    </>
  );
};

export default api.withTRPC(MyApp);
