import React from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_STOPS = 5;

function makeEmptyStop(currentType) {
  return {
    localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    thresholdType: currentType || "percent",
    thresholdValue: "20",
    llmId: "",
    isEnabled: true,
  };
}

const SwitchStopsSection = ({
  isLoading,
  stops,
  setStops,
  switchModelUnavailablePolicy,
  setSwitchModelUnavailablePolicy,
  switchResolution,
  availableModels,
  markDirty,
}) => {
  const activeModels = availableModels.filter((m) => m.isActive !== false);

  const updateStop = (localId, patch) => {
    setStops((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s)),
    );
    markDirty();
  };

  const removeStop = (localId) => {
    setStops((prev) => prev.filter((s) => s.localId !== localId));
    markDirty();
  };

  const addStop = () => {
    if (stops.length >= MAX_STOPS) return;
    setStops((prev) => [...prev, makeEmptyStop(prev[0]?.thresholdType)]);
    markDirty();
  };

  const duplicateKeys = new Set();
  const seen = new Set();
  for (const s of stops) {
    const key = `${s.thresholdType}:${s.thresholdValue}`;
    if (seen.has(key)) duplicateKeys.add(key);
    seen.add(key);
  }

  const distinctTypes = new Set(stops.map((s) => s.thresholdType));
  const hasMixedTypes = distinctTypes.size > 1;

  return (
    <div className="space-y-4 border-t border-gray-100 pt-6">
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-gray-900">
          Quota-Based Model Switch Stops
        </Label>
        <p className="text-muted-foreground max-w-[650px] text-[12px] leading-relaxed">
          Automatically switch to a cheaper model as your remaining message
          quota shrinks. Add ordered stops — when your remaining quota drops
          below a stop&apos;s threshold, that stop&apos;s model is used. All
          stops for a chatbot must use the same threshold type (percent or
          messages remaining).
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-md" />
      ) : (
        <>
          {hasMixedTypes && (
            <p className="flex items-center gap-1 text-[11px] text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              Switch stops are mixing percent and messages-remaining
              thresholds — all stops must use the same type before saving.
            </p>
          )}

          <div className="space-y-3">
            {stops.map((stop) => {
              const key = `${stop.thresholdType}:${stop.thresholdValue}`;
              const isDuplicate = duplicateKeys.has(key);
              const stopModel = activeModels.find((m) => m.id === stop.llmId);
              const modelInactive =
                stop.llmId && !activeModels.some((m) => m.id === stop.llmId);

              return (
                <div
                  key={stop.localId}
                  className="space-y-2 rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={stop.thresholdType === "percent" ? 99 : undefined}
                        value={stop.thresholdValue}
                        onChange={(e) =>
                          updateStop(stop.localId, {
                            thresholdValue: e.target.value,
                          })
                        }
                        className="w-24 border-gray-200"
                      />
                      <Select
                        value={stop.thresholdType}
                        onValueChange={(val) =>
                          updateStop(stop.localId, { thresholdType: val })
                        }
                      >
                        <SelectTrigger className="w-36 border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">% remaining</SelectItem>
                          <SelectItem value="absolute">
                            messages remaining
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Select
                      value={stop.llmId || undefined}
                      onValueChange={(val) =>
                        updateStop(stop.localId, { llmId: val })
                      }
                    >
                      <SelectTrigger className="min-w-[180px] flex-1 border-gray-200">
                        <SelectValue placeholder="Select switch-to model" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={stop.isEnabled}
                        onCheckedChange={(v) =>
                          updateStop(stop.localId, { isEnabled: v })
                        }
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeStop(stop.localId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isDuplicate && (
                    <p className="flex items-center gap-1 text-[11px] text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      Duplicate threshold — each threshold must be unique.
                    </p>
                  )}
                  {modelInactive && (
                    <p className="flex items-center gap-1 text-[11px] text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      This model is no longer active. The unavailable-model
                      policy below will apply instead.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStop}
            disabled={stops.length >= MAX_STOPS}
            className="border-gray-200"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add stop
          </Button>
          {stops.length >= MAX_STOPS && (
            <p className="text-muted-foreground text-[12px]">
              Maximum of {MAX_STOPS} stops reached.
            </p>
          )}

          {/* Fallback policy when the switch-to model becomes unavailable */}
          <div className="space-y-2 pt-4">
            <Label className="text-sm font-semibold text-gray-900">
              If the switch-to model becomes unavailable
            </Label>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="switchModelUnavailablePolicy"
                  checked={switchModelUnavailablePolicy === "next_cheaper"}
                  onChange={() => {
                    setSwitchModelUnavailablePolicy("next_cheaper");
                    markDirty();
                  }}
                />
                Use the next cheaper active model
                {switchResolution?.nextCheaper && (
                  <span className="text-muted-foreground text-[12px]">
                    — currently {switchResolution.nextCheaper.title}
                  </span>
                )}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="switchModelUnavailablePolicy"
                  checked={switchModelUnavailablePolicy === "base_model"}
                  onChange={() => {
                    setSwitchModelUnavailablePolicy("base_model");
                    markDirty();
                  }}
                />
                Fall back to the base GPT model
                {switchResolution?.baseModel && (
                  <span className="text-muted-foreground text-[12px]">
                    — currently {switchResolution.baseModel.title}
                  </span>
                )}
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { makeEmptyStop, MAX_STOPS };
export default SwitchStopsSection;
