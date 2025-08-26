"use client";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ClientProvider = ({ children }: Props) => {
  return <>{children}</>;
};

export default ClientProvider;
