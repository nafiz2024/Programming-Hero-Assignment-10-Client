import "../styles/globals.css";

import { Geist } from "next/font/google";

import { AuthProvider } from "@/providers/AuthProvider";
import { UIProvider } from "@/providers/UIProvider";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "PromptFlow",
  description: "PromptFlow frontend client",
};

export default function RootLayout({ children }) {
  return (
    <html className={geist.className} data-scroll-behavior="smooth" lang="en">
      <body className="bg-background text-foreground">
        <AuthProvider>
          <UIProvider>{children}</UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
