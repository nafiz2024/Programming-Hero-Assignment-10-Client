import "../styles/globals.css";

import { AuthProvider } from "@/providers/AuthProvider";
import { UIProvider } from "@/providers/UIProvider";

export const metadata = {
  title: "PromptFlow",
  description: "PromptFlow frontend client",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>{children}</UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
