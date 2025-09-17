"use client";
import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
};

export default function SafeLink({ href, children }: Props) {
  return <Link href={href}>{children}</Link>;
}
