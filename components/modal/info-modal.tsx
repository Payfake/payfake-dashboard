"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showButtons?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function InfoModal({
  isOpen,
  onClose,
  title,
  children,
  showButtons = true,
  onConfirm,
  confirmText = "Close",
  size = "md",
}: InfoModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`w-full ${sizes[size]} max-h-[85vh] overflow-y-auto bg-black border border-white/10 rounded-2xl p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 cursor-pointer text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-white/80">{children}</div>

            {showButtons && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={onConfirm || onClose}
                  className="px-4 py-2 cursor-pointer bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
