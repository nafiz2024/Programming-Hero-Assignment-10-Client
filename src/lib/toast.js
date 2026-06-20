"use client";

import { toast } from "react-toastify";

import ToastContent from "@/components/ui/ToastContent";

function showToast(message, tone, options = {}) {
  return toast(({ closeToast }) => (
    <ToastContent
      message={message}
      onClose={closeToast}
      title={options.title}
      tone={tone}
    />
  ));
}

export function toastSuccess(message, options) {
  return showToast(message, "success", options);
}

export function toastWarning(message, options) {
  return showToast(message, "warning", options);
}

export function toastError(message, options) {
  return showToast(message, "error", options);
}
