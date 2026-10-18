import type { Metadata } from "next";
import { GuidePage } from "@/components/GuidePage";

export const metadata: Metadata = { title: "How to use · Nirmol" };
export default function Guide() {
  return <GuidePage />;
}
