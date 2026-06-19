import "../styles/globals.css";

import { AuthProvider } from "@/providers/AuthProvider";

export const metadata = {
  title: "PromptFlow",
  description: "PromptFlow frontend client",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
