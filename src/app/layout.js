import "../styles/globals.css";

export const metadata = {
  title: "PromptFlow",
  description: "PromptFlow frontend client",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
