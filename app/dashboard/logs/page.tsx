"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLogStore } from "@/stores/useLogStore";
import { formatDateTime } from "@/lib/utils";
import { TableSkeleton } from "@/components/loader";
import { InfoModal, ConfirmModal } from "@/components/modal";
import { Button } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Copy,
  Check,
} from "lucide-react";

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-500 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  PATCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function LogsPage() {
  const { logs, meta, isLoading, fetchLogs, clearLogs } = useLogStore();
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleClearLogs = async () => {
    setClearing(true);
    await clearLogs();
    setClearing(false);
    setShowClearConfirm(false);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const formatJson = (json: string) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return "text-green-500";
    if (status >= 300 && status < 400) return "text-blue-500";
    if (status >= 400 && status < 500) return "text-yellow-500";
    if (status >= 500) return "text-red-500";
    return "text-white/60";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">API Logs</h1>
          <p className="text-white/60">View and inspect all API requests</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowClearConfirm(true)}
          icon={<Trash2 className="w-4 h-4" />}
        >
          Clear Logs
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Method
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Path
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Duration
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  IP Address
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Time
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <TableSkeleton rows={8} columns={7} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/40">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${methodColors[log.method] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm font-mono text-white/80">
                        {log.path.length > 40
                          ? log.path.slice(0, 40) + "..."
                          : log.path}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-sm font-medium ${getStatusColor(log.status_code)}`}
                      >
                        {log.status_code}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-white/80">
                        {log.duration_ms}ms
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm font-mono text-white/60">
                        {log.ip_address}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-white/60">
                        {formatDateTime(log.logged_at)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.pages > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
            <p className="text-sm text-white/40">
              Showing {(meta.page - 1) * meta.per_page + 1} to{" "}
              {Math.min(meta.page * meta.per_page, meta.total)} of {meta.total}{" "}
              logs
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
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Request Details"
        size="xl"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-white/40 mb-1">Method</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${methodColors[selectedLog.method] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}
                >
                  {selectedLog.method}
                </span>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Status</p>
                <span
                  className={`text-sm font-medium ${getStatusColor(selectedLog.status_code)}`}
                >
                  {selectedLog.status_code}
                </span>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Duration</p>
                <p className="text-sm text-white/80">
                  {selectedLog.duration_ms}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">IP Address</p>
                <code className="text-sm font-mono text-white/60">
                  {selectedLog.ip_address}
                </code>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Path</p>
              <code className="text-sm font-mono text-white/80 break-all">
                {selectedLog.path}
              </code>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Request ID</p>
              <code className="text-sm font-mono text-white/60">
                {selectedLog.request_id}
              </code>
            </div>

            <div>
              <p className="text-xs text-white/40 mb-1">Time</p>
              <p className="text-sm text-white/80">
                {formatDateTime(selectedLog.logged_at)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/40">Request Body</p>
                <button
                  onClick={() =>
                    copyToClipboard(selectedLog.request_body, "request")
                  }
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/40 hover:text-white transition-colors rounded cursor-pointer"
                >
                  {copied === "request" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-white/5 border border-white/10 rounded-lg overflow-x-auto text-xs font-mono text-white/80 max-h-64">
                {formatJson(selectedLog.request_body)}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/40">Response Body</p>
                <button
                  onClick={() =>
                    copyToClipboard(selectedLog.response_body, "response")
                  }
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-white/40 hover:text-white transition-colors rounded cursor-pointer"
                >
                  {copied === "response" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-white/5 border border-white/10 rounded-lg overflow-x-auto text-xs font-mono text-white/80 max-h-64">
                {formatJson(selectedLog.response_body)}
              </pre>
            </div>
          </div>
        )}
      </InfoModal>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearLogs}
        title="Clear All Logs"
        message="This action cannot be undone. All API logs will be permanently deleted."
        confirmText="Clear Logs"
        variant="danger"
        loading={clearing}
      />
    </div>
  );
}
