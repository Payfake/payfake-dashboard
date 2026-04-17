"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Copy,
  Check,
  Mail,
  Phone,
  Receipt,
} from "lucide-react";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  customer_code: string;
  created_at: string;
  metadata: Record<string, any>;
}

interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Meta {
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  success: "bg-green-500/10 text-green-500 border-green-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [customerTransactions, setCustomerTransactions] = useState<
    Transaction[]
  >([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "20",
      });
      if (search) params.append("search", search);

      const response = await api.get(`/control/customers?${params}`);
      setCustomers(response.data.data.customers);
      setMeta(response.data.data.meta);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async (customerCode: string) => {
    setTransactionsLoading(true);
    try {
      const response = await api.get(
        `/customer/${customerCode}/transactions?per_page=10`,
      );
      setCustomerTransactions(response.data.data.transactions);
    } catch (error) {
      console.error("Failed to fetch customer transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const openCustomerModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerTransactions(customer.customer_code);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Customers</h1>
        <p className="text-white/60">
          Manage your customers and view their activity
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by email, name or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-white/30 outline-none text-white placeholder:text-white/30"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          Search
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Customer Code
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Joined
                </th>
                <th className="text-left text-xs font-medium text-white/40 uppercase tracking-wider py-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white mx-auto" />
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-white/40">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-white">
                        {customer.first_name} {customer.last_name}
                      </p>
                      {!customer.first_name && !customer.last_name && (
                        <p className="text-sm text-white/40">—</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-white/40" />
                          <p className="text-sm text-white">{customer.email}</p>
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-white/40" />
                            <p className="text-sm text-white/80">
                              {customer.phone}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-white/80">
                          {customer.customer_code}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(customer.customer_code, customer.id)
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied === customer.id ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-white/80">
                        {formatDate(customer.created_at)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => openCustomerModal(customer)}
                        className="p-2 cursor-pointer text-white/40 hover:text-white transition-colors"
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

        {meta && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
            <p className="text-sm text-white/40">
              Showing {(meta.page - 1) * meta.per_page + 1} to{" "}
              {Math.min(meta.page * meta.per_page, meta.total)} of {meta.total}{" "}
              customers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/60">
                Page {page} of {meta.pages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.pages}
                className="p-2 text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[80vh] overflow-y-auto bg-black border border-white/10 rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-6">Customer Details</h2>

              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Name</p>
                    <p className="text-lg font-medium">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                      {!selectedCustomer.first_name &&
                        !selectedCustomer.last_name &&
                        "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Customer Code</p>
                    <code className="text-sm font-mono">
                      {selectedCustomer.customer_code}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Email</p>
                    <p className="text-sm">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Phone</p>
                    <p className="text-sm">{selectedCustomer.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Joined</p>
                    <p className="text-sm">
                      {formatDate(selectedCustomer.created_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Receipt className="w-4 h-4 text-white/60" />
                    <h3 className="font-medium">Recent Transactions</h3>
                  </div>

                  {transactionsLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white mx-auto" />
                    </div>
                  ) : customerTransactions.length === 0 ? (
                    <p className="text-sm text-white/40 py-4">
                      No transactions found
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customerTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <div>
                            <code className="text-sm font-mono">
                              {tx.reference}
                            </code>
                            <p className="text-xs text-white/40">
                              {formatDate(tx.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">
                              {formatCurrency(tx.amount, tx.currency)}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[tx.status]}`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
