import type { Metadata } from "next";
import "./globals.css";

import { SessionProvider } from "@/components/session-provider";
import type { ReactNode } from "react";


export const metadata: Metadata = {
  title: "Transpo",
  description: "Escrow logistics payment platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>;
      </body>
    </html>
  );
}
