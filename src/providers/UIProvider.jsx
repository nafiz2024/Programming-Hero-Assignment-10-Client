"use client";

import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export function UIProvider({ children }) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <HeroUIProvider navigate={router.push}>
      {children}
      <ToastContainer
        autoClose={3500}
        bodyClassName={() => "!p-0"}
        className="!z-[100]"
        closeButton={false}
        draggable
        hideProgressBar
        newestOnTop
        pauseOnFocusLoss={false}
        closeOnClick
        pauseOnHover
        position={isMobile ? "top-center" : "top-right"}
        theme="dark"
        toastClassName={() => "!min-h-0 !bg-transparent !p-0 !shadow-none"}
      />
    </HeroUIProvider>
  );
}
