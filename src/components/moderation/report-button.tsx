"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { submitReport } from "@/lib/actions";
import { REPORT_REASONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { ReportTargetType } from "@/lib/types";

type ReportReason = (typeof REPORT_REASONS)[number];

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    const finalReason =
      reason === "Other" ? customReason.trim() : reason;
    startTransition(async () => {
      const result = await submitReport(targetType, targetId, finalReason);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Report submitted. Our moderators will review it.");
      setOpen(false);
    });
  }

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((value) => !value)}
        className="text-muted"
      >
        <Flag className="mr-1 h-4 w-4" />
        Report
      </Button>

      {open && (
        <div className="mt-2 space-y-2 rounded-lg border border-border bg-bg p-3">
          <label className="block text-xs font-medium text-muted">
            Reason
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value as ReportReason)}
              className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-2 text-sm"
            >
              {REPORT_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {reason === "Other" && (
            <textarea
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              placeholder="Describe the issue..."
              className="min-h-20 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={pending}>
              {pending ? "Submitting..." : "Submit report"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {message && <p className="mt-2 text-xs text-muted">{message}</p>}
    </div>
  );
}
