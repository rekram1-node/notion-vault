import React from "react";
import Navbar from "~/components/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { SnackbarProvider } from "notistack";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hideNavbarOnRoutes = ["/protected"]; // we want to hide navbar for integration renders (at least as of now...)
  return (
    <>
      <ClerkProvider>
        <SnackbarProvider>
          {!hideNavbarOnRoutes.includes(router.pathname) && <Navbar />}
          <main>{children}</main>
        </SnackbarProvider>
      </ClerkProvider>
    </>
  );
}
