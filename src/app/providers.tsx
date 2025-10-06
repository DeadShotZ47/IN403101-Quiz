"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProviders;
