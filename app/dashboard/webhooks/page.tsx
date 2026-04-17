"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWebhookStore } from "@/stores/useWebhookStore";
import { formatDateTime } from "@/lib/utils";
import { TableSkeleton } from "@/components/loader";
import { InfoModal } from "@/components/modal";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const eventColors: Record<string, string> = {
  "charge.success": "bg-green-500/10 text-green-500 border-green-500/20",
  "charge.failed": "bg-red-500/10 text-red-500 border-red-500/20",
  "transfer.success": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "transfer.failed": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "refund.processed": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

export default function WebhooksPage() {
  const {
    webhooks,
    meta,
    isLoading,
    attempts,
    attemptsLoading,
    fetchWebhooks,
    fetchAttempts,
    retryWebhook,
  } = useWebhookStore();

  const [page, setPage] = useState(1);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [retrying, setRetrying] = useState("");

  useEffect(() => {
    fetchWebhooks(page);
  }, [page]);

  const handleRetry = async (webhookId: string) => {
    setRetrying(webhookId);
    await retryWebhook(webhookId);
    setRetrying("");
  };

  const openWebhookModal = (webhook: any) => {
    setSelectedWebhook(webhook);
    fetchAttempts(webhook.id);
  };

  const getEventLabel = (event: string): string => {
    return event
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Webhooks</h1>
        <p className="text-white/60">
          Monitor webhook delivery and retry failed events
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Event
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Transaction
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Attempts
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Last Attempt
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
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/40">
                    No webhooks found
                  </td>
                </tr>
              ) : (
                webhooks.map((webhook, index) => (
                  <motion.tr
                    key={webhook.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${eventColors[webhook.event] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
                      >
                        {getEventLabel(webhook.event)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm font-mono text-white/80">
                        {webhook.transaction_id}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      {webhook.delivered ? (
                        <div className="flex items-center gap-1.5 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Delivered</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-white/80">
                        {webhook.attempts}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {webhook.last_attempt_at ? (
                        <p className="text-sm text-white/80">
                          {formatDateTime(webhook.last_attempt_at)}
                        </p>
                      ) : (
                        <span className="text-sm text-white/40">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openWebhookModal(webhook)}
                          className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!webhook.delivered && (
                          <button
                            onClick={() => handleRetry(webhook.id)}
                            disabled={retrying === webhook.id}
                            className="p-2 text-white/40 hover:text-yellow-500 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {retrying === webhook.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
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
              webhooks
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

      <InfoModal
        isOpen={!!selectedWebhook}
        onClose={() => setSelectedWebhook(null)}
        title="Webhook Details"
        size="xl"
      >
        {selectedWebhook && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Event</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${eventColors[selectedWebhook.event] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
                >
                  {getEventLabel(selectedWebhook.event)}
                </span>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Transaction ID</p>
                <code className="text-sm font-mono">
                  {selectedWebhook.transaction_id}
                </code>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Status</p>
                {selectedWebhook.delivered ? (
                  <div className="flex items-center gap-1.5 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Delivered</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-500">
                    <XCircle className="w-4 h-4" />
                    <span className="text-sm">Failed</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Created</p>
                <p className="text-sm">
                  {formatDateTime(selectedWebhook.created_at)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-2">Payload</p>
              <pre className="p-4 bg-white/5 border border-white/10 rounded-lg overflow-x-auto text-xs font-mono text-white/80 max-h-64">
                {JSON.stringify(selectedWebhook.payload, null, 2)}
              </pre>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-white/60" />
                <h3 className="font-medium">Delivery Attempts</h3>
              </div>

              {attemptsLoading ? (
                <TableSkeleton rows={3} columns={1} />
              ) : attempts.length === 0 ? (
                <p className="text-sm text-white/40 py-4">
                  No attempts recorded
                </p>
              ) : (
                <div className="space-y-2">
                  {attempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {attempt.succeeded ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            Status: {attempt.status_code || "Network Error"}
                          </span>
                        </div>
                        <span className="text-xs text-white/40">
                          {formatDateTime(attempt.attempted_at)}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-mono break-all">
                        {attempt.response_body || "No response"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </InfoModal>
    </div>
  );
}
