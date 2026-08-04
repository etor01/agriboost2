"use client";

/**
 * WalletTopUpModal
 *
 * Dynamically imports WalletTopUpModalContent with ssr: false.
 * This completely prevents Next.js SSR from attempting to load or execute
 * react-paystack / @paystack/inline-js on the server (which throws
 * 'window is not defined').
 */

import dynamic from "next/dynamic";
import React from "react";

interface WalletTopUpModalProps {
  userEmail: string;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const WalletTopUpModalContent = dynamic(
  () => import("./WalletTopUpModalContent"),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function WalletTopUpModal(props: WalletTopUpModalProps) {
  return <WalletTopUpModalContent {...props} />;
}
