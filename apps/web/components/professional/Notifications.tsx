// components/Notifications.tsx
"use client";
import { Toaster } from "react-hot-toast";
import OneSignalInit from "@/components/OneSignalInit";

const Notifications = () => {
  return (
    <>
      <OneSignalInit />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default Notifications;
