"use client";

import { useCallback, useState } from "react";

type ToastVariant = "default" | "destructive" | "success";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastOptions = Omit<Toast, "id">;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 5000,
    }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 11);

      // Agregar el toast
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, variant },
      ]);

      // Eliminar el toast después de la duración
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        );
      }, duration);

      // Devolver el ID para poder eliminarlo manualmente si es necesario
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toast,
    toasts,
    removeToast,
    success: (options: Omit<ToastOptions, "variant">) =>
      toast({ ...options, variant: "success" }),
    error: (options: Omit<ToastOptions, "variant">) =>
      toast({ ...options, variant: "destructive" }),
  };
};

export type { Toast, ToastVariant };
