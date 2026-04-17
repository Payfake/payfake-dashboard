"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { TableSkeleton } from "@/components/loader";
import { ConfirmModal } from "@/components/modal";
import { Button } from "@/components/ui";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Zap,
  Copy,
  Check,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  success: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  abandoned: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  reversed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

export default function TransactionsPage() {
  const {
    transactions,
    meta,
    isLoading,
    fetchTransactions,
    refundTransaction,
    forceTransaction,
  } = useTransactionStore();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [copied, setCopied] = useState("");
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });
  const [forceModal, setForceModal] = useState<{
    isOpen: boolean;
    reference: string;
  }>({ isOpen: false, reference: "" });

  useEffect(() => {
    fetchTransactions(page, status);
  }, [page, status]);

  const copyReference = (reference: string) => {
    navigator.clipboard?.writeText(reference);
    setCopied(reference);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleRefund = async () => {
    await refundTransaction(refundModal.id);
    setRefundModal({ isOpen: false, id: "" });
  };

  const handleForce = async (outcome: string) => {
    await forceTransaction(forceModal.reference, outcome);
    setForceModal({ isOpen: false, reference: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Transactions</h1>
        <p className="text-white/60">
          View and manage your payment transactions
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or customer..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-white/30 outline-none text-white placeholder:text-white/30"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-white/30 outline-none text-white cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="abandoned">Abandoned</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Reference
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <TableSkeleton rows={5} columns={6} />
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-white">
                          {tx.reference.slice(0, 12)}...
                        </code>
                        <button
                          onClick={() => copyReference(tx.reference)}
                          className="cursor-pointer"
                        >
                          {copied === tx.reference ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-white">
                        {tx.customer.first_name} {tx.customer.last_name}
                      </p>
                      <p className="text-xs text-white/40">
                        {tx.customer.email}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[tx.status]}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-white/80">
                        {formatDate(tx.created_at)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTransaction(tx)}
                          className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {tx.status === "success" && (
                          <button
                            onClick={() =>
                              setRefundModal({ isOpen: true, id: tx.id })
                            }
                            className="p-2 text-white/40 hover:text-orange-500 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {tx.status === "pending" && (
                          <button
                            onClick={() =>
                              setForceModal({
                                isOpen: true,
                                reference: tx.reference,
                              })
                            }
                            className="p-2 text-white/40 hover:text-yellow-500 transition-colors cursor-pointer"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
            <p className="text-sm text-white/40">
              Showing {(meta.page - 1) * meta.per_page + 1} to{" "}
              {Math.min(meta.page * meta.per_page, meta.total)} of {meta.total}{" "}
              transactions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/60">
                Page {page} of {meta.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.pages}
                className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-black border border-white/10 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Reference</p>
                    <code className="text-sm font-mono">
                      {selectedTransaction.reference}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Status</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[selectedTransaction.status]}`}
                    >
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Amount</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(
                        selectedTransaction.amount,
                        selectedTransaction.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Channel</p>
                    <p className="text-sm capitalize">
                      {selectedTransaction.channel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Customer</p>
                    <p className="text-sm">
                      {selectedTransaction.customer.first_name}{" "}
                      {selectedTransaction.customer.last_name}
                    </p>
                    <p className="text-xs text-white/60">
                      {selectedTransaction.customer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Created</p>
                    <p className="text-sm">
                      {formatDateTime(selectedTransaction.created_at)}
                    </p>
                  </div>
                  {selectedTransaction.paid_at && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Paid At</p>
                      <p className="text-sm">
                        {formatDateTime(selectedTransaction.paid_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedTransaction(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, id: "" })}
        onConfirm={handleRefund}
        title="Refund Transaction"
        message="Are you sure you want to refund this transaction? This action cannot be undone."
        confirmText="Refund"
        variant="warning"
      />

      <ConfirmModal
        isOpen={forceModal.isOpen}
        onClose={() => setForceModal({ isOpen: false, reference: "" })}
        onConfirm={() => handleForce("success")}
        title="Force Transaction Outcome"
        message="Choose the outcome for this pending transaction."
        confirmText="Mark as Success"
        variant="info"
      />
    </div>
  );
}
