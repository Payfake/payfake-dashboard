"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui";
import { ConfirmModal } from "@/components/modal";
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Store,
  Mail,
  User,
  Globe,
} from "lucide-react";

interface Keys {
  public_key: string;
  secret_key: string;
}

export default function SettingsPage() {
  const { merchant, fetchMerchant } = useAuthStore();
  const [keys, setKeys] = useState<Keys | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookSaved, setWebhookSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const keysResponse = await api.get("/auth/keys");
      setKeys(keysResponse.data.data);

      const profileResponse = await api.get("/merchant");
      setWebhookUrl(profileResponse.data.data.webhook_url || "");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateKeys = async () => {
    setRegenerating(true);
    try {
      const response = await api.post("/auth/keys/regenerate");
      setKeys(response.data.data);
      setShowRegenerateConfirm(false);
    } catch (error) {
      console.error("Failed to regenerate keys:", error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveWebhook = async () => {
    setSavingWebhook(true);
    try {
      await api.put("/merchant", { webhook_url: webhookUrl });
      setWebhookSaved(true);
      setTimeout(() => setWebhookSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save webhook:", error);
    } finally {
      setSavingWebhook(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-white/60">Manage your account and API keys</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium">Business Profile</h3>
            <p className="text-sm text-white/60">Your merchant information</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Business Name
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={merchant?.business_name || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={merchant?.email || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Merchant ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={merchant?.id || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium">Webhook URL</h3>
            <p className="text-sm text-white/60">
              Receive payment notifications
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-1.5">
            Endpoint URL
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://yourapp.com/webhook"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          {webhookSaved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-500"
            >
              Saved
            </motion.span>
          )}
          <Button onClick={handleSaveWebhook} loading={savingWebhook}>
            Save Webhook
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Key className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-medium">API Keys</h3>
              <p className="text-sm text-white/60">
                Use these keys to authenticate API requests
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowRegenerateConfirm(true)}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Regenerate
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Public Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={keys?.public_key || ""}
                readOnly
                className="w-full px-4 py-2.5 pr-12 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
              />
              <button
                onClick={() =>
                  copyToClipboard(keys?.public_key || "", "public")
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {copied === "public" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-white/40 mt-1">
              Safe to expose in client-side code
            </p>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecretKey ? "text" : "password"}
                value={keys?.secret_key || ""}
                readOnly
                className="w-full px-4 py-2.5 pr-20 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showSecretKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(keys?.secret_key || "", "secret")
                  }
                  className="p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {copied === "secret" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-1">
              Keep this secret. Never expose in client-side code.
            </p>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleRegenerateKeys}
        title="Regenerate API Keys"
        message="This will immediately invalidate your current secret key. Any applications using the old key will stop working."
        confirmText="Regenerate"
        variant="danger"
        loading={regenerating}
      />
    </div>
  );
}
