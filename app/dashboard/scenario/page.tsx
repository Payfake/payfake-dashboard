"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useScenarioStore } from "@/stores/useScenarioStore";
import { Button } from "@/components/ui";
import { ConfirmModal } from "@/components/modal";
import {
  Zap,
  RotateCcw,
  AlertCircle,
  Check,
  Clock,
  Percent,
} from "lucide-react";

const errorCodes = [
  { value: "", label: "None" },
  { value: "CHARGE_FAILED", label: "Charge Failed" },
  { value: "CHARGE_INVALID_CARD", label: "Invalid Card" },
  { value: "CHARGE_CARD_EXPIRED", label: "Card Expired" },
  { value: "CHARGE_INVALID_CVV", label: "Invalid CVV" },
  { value: "CHARGE_INVALID_PIN", label: "Invalid PIN" },
  { value: "CHARGE_INSUFFICIENT_FUNDS", label: "Insufficient Funds" },
  { value: "CHARGE_DO_NOT_HONOR", label: "Do Not Honor" },
  { value: "CHARGE_NOT_PERMITTED", label: "Not Permitted" },
  { value: "CHARGE_LIMIT_EXCEEDED", label: "Limit Exceeded" },
  { value: "CHARGE_NETWORK_ERROR", label: "Network Error" },
  { value: "CHARGE_MOMO_TIMEOUT", label: "MoMo Timeout" },
  { value: "CHARGE_MOMO_INVALID_NUMBER", label: "Invalid MoMo Number" },
  { value: "CHARGE_MOMO_LIMIT_EXCEEDED", label: "MoMo Limit Exceeded" },
  { value: "CHARGE_MOMO_PROVIDER_UNAVAILABLE", label: "Provider Unavailable" },
];

const forceStatuses = [
  { value: "", label: "None" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "abandoned", label: "Abandoned" },
];

export default function ScenarioPage() {
  const { scenario, isLoading, fetchScenario, updateScenario, resetScenario } =
    useScenarioStore();
  const [failureRate, setFailureRate] = useState(0);
  const [delayMs, setDelayMs] = useState(0);
  const [forceStatus, setForceStatus] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchScenario();
  }, []);

  useEffect(() => {
    if (scenario) {
      setFailureRate(scenario.failure_rate);
      setDelayMs(scenario.delay_ms);
      setForceStatus(scenario.force_status || "");
      setErrorCode(scenario.error_code || "");
    }
  }, [scenario]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const updates: any = {};
    if (failureRate !== scenario?.failure_rate)
      updates.failure_rate = failureRate;
    if (delayMs !== scenario?.delay_ms) updates.delay_ms = delayMs;
    if (forceStatus !== (scenario?.force_status || ""))
      updates.force_status = forceStatus || null;
    if (errorCode !== (scenario?.error_code || ""))
      updates.error_code = errorCode || null;

    if (Object.keys(updates).length > 0) {
      await updateScenario(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    await resetScenario();
    setShowResetConfirm(false);
  };

  const hasChanges =
    failureRate !== (scenario?.failure_rate || 0) ||
    delayMs !== (scenario?.delay_ms || 0) ||
    forceStatus !== (scenario?.force_status || "") ||
    errorCode !== (scenario?.error_code || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Scenario Control
          </h1>
          <p className="text-white/60">
            Configure test scenarios and failure simulation
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowResetConfirm(true)}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reset to Defaults
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Percent className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-medium">Failure Rate</h3>
              <p className="text-sm text-white/60">
                Probability of charge failure
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={failureRate}
                onChange={(e) => setFailureRate(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="w-16 text-center text-lg font-medium">
                {(failureRate * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-white/40">
              0% = never fail, 100% = always fail
            </p>
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
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium">Artificial Delay</h3>
              <p className="text-sm text-white/60">
                Add latency to simulate real-world conditions
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="30000"
                step="500"
                value={delayMs}
                onChange={(e) => setDelayMs(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="w-20 text-center text-lg font-medium">
                {delayMs >= 1000
                  ? `${(delayMs / 1000).toFixed(1)}s`
                  : `${delayMs}ms`}
              </span>
            </div>
            <p className="text-xs text-white/40">Max 30 seconds (30000ms)</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium">Force Status</h3>
              <p className="text-sm text-white/60">
                Override all charges to a specific status
              </p>
            </div>
          </div>

          <select
            value={forceStatus}
            onChange={(e) => setForceStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-white/30 outline-none text-white cursor-pointer"
          >
            {forceStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-medium">Error Code</h3>
              <p className="text-sm text-white/60">
                Specific error when force status is failed
              </p>
            </div>
          </div>

          <select
            value={errorCode}
            onChange={(e) => setErrorCode(e.target.value)}
            disabled={forceStatus !== "failed"}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-white/30 outline-none text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {errorCodes.map((code) => (
              <option key={code.value} value={code.value}>
                {code.label}
              </option>
            ))}
          </select>
          {forceStatus !== "failed" && (
            <p className="text-xs text-white/40">
              Set force status to "Failed" to enable error code selection
            </p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex items-center justify-end gap-3"
      >
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-green-500 text-sm"
          >
            <Check className="w-4 h-4" />
            Scenario updated
          </motion.div>
        )}
        <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
          Save Changes
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-400 font-medium mb-1">
              How scenarios work
            </p>
            <ul className="text-sm text-white/60 space-y-1">
              <li>
                • <strong>Failure Rate:</strong> Probability that a charge will
                fail (0-100%)
              </li>
              <li>
                • <strong>Delay:</strong> Simulated processing time before
                webhook delivery
              </li>
              <li>
                • <strong>Force Status:</strong> Overrides failure rate and
                forces all charges to this outcome
              </li>
              <li>
                • <strong>Error Code:</strong> The specific error returned when
                a charge fails
              </li>
              <li>• Changes take effect immediately for new charges</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Scenario"
        message="This will reset all scenario settings to their default values (0% failure, 0ms delay, no force status)."
        confirmText="Reset"
        variant="warning"
      />
    </div>
  );
}
