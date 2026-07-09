import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WirePilot AI",
  description: "AI-powered Product Management Workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
