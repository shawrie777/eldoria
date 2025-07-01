"use client"
import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { DmContext } from "./context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dmMode, setDmMode] = useState<boolean>(false);
  const [dmSwitch, setDmSwitch] = useState<boolean>(false);

  useEffect(()=>{
    setDmSwitch(localStorage.getItem("dmMode") !== null);
  }, [])

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DmContext value={dmMode}>
          {dmSwitch && <label className="dmSwitch">
            <input type="checkbox" onChange={e => setDmMode(e.target.checked)}/>
            <span />
          </label>}
          {children}
        </DmContext>
      </body>
    </html>
  );
}
