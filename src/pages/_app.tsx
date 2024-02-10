import { type AppType } from "next/app";
import Layout from "~/pages/layout";
import { Theme } from "@radix-ui/themes";
import Head from "next/head";

import "~/styles/globals.css";

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
          <Theme>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Theme>
        </div>
      </div>
    </>
  );
};

export default MyApp;
