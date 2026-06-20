"use client";

import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export function UIProvider({ children }) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </HeroUIProvider>
  );
}
