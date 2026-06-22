import "../styles/globals.css";

import { Geist } from "next/font/google";

import { AuthProvider } from "@/providers/AuthProvider";
import { BookmarksProvider } from "@/providers/BookmarksProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
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
    <html className={geist.className} data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        <AuthProvider>
          <BookmarksProvider>
            <NotificationsProvider>
              <UIProvider>{children}</UIProvider>
            </NotificationsProvider>
          </BookmarksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
