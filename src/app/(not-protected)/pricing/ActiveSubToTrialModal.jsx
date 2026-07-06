"use client";

import React from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ActiveSubToTrialModal({
  isOpen,
  onClose,
  currentPlanName,
  targetPlanName,
  currentPeriodEnd,
  loading,
  onConfirm,
}) {
  const periodEndLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You already have an active plan</DialogTitle>
          <DialogDescription>
            You&apos;re currently on <strong>{currentPlanName}</strong>
            {periodEndLabel && (
              <>
                {" "}
                until <strong>{periodEndLabel}</strong>
              </>
            )}
            . Please cancel it if you&apos;d like to stop it, or continue below
            to start a free trial of <strong>{targetPlanName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Starting a trial of {targetPlanName} will immediately replace your
            current plan. Your remaining quota and usage on{" "}
            <strong>{currentPlanName}</strong> — including any imported data
            tied to plan limits — will be <strong>lost</strong> and cannot be
            recovered. This cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep my current plan
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Starting trial..." : `Yes, start ${targetPlanName} trial`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
