import { type AppType } from "next/app";
import Layout from "~/pages/layout";
import {
  ChakraBaseProvider,
  extendBaseTheme,
  theme as chakraTheme,
} from '@chakra-ui/react'

import "~/styles/globals.css";

const { Button } = chakraTheme.components

const theme = extendBaseTheme({
  components: {
    Button,
  },
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraBaseProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraBaseProvider>
  );
};

export default MyApp;
