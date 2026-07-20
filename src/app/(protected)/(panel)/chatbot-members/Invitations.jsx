"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useChatbot } from "@/context/ChatbotContext";
import { Button } from "@/components/ui/button";
import GatedAction from "@/components/GatedAction";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Loader2, RefreshCw, X, Check, Info } from "lucide-react";
import { ROLES, ROLE_LEVEL } from "./ChatbotMembers";
import { useMemberUsage } from "../account-members/MemberUsageBadge";

const STATUS_BADGE = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  EXPIRED: "bg-red-100 text-red-600",
  REVOKED: "bg-gray-100 text-gray-500",
};

export const OutgoingInvitations = () => {
  const { user } = useAuth();
  const { atLimit } = useMemberUsage();
  const { selectedChatbot } = useChatbot();
  const [outgoingInvitations, setOutgoingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Send invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("AGENT");
  const [sending, setSending] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const outgoingRes = await api.get("/teams/chatbot-invitations/sent");
      if (outgoingRes.data.success) {
        setOutgoingInvitations(outgoingRes.data.data.invitations || []);
      }
    } catch (error) {
      console.error("Failed to fetch outgoing invitations:", error);
      toast.error("Failed to fetch outgoing invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      setSending(true);
      const chatbotId = selectedChatbot?.id || selectedChatbot?.chatbotId;
      if (!chatbotId) {
        toast.error("No chatbot selected. Please select a chatbot first.");
        setSending(false);
        return;
      }
      const response = await api.post("/teams/chatbot-invitations/send", {
        email: inviteEmail,
        role: inviteRole,
        chatbotId,
      });
      if (response.data.success) {
        toast.success("Invitation sent successfully");
        setInviteEmail("");
        setInviteRole("AGENT");
        fetchInvitations();
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to send invitation.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (invitationId) => {
    try {
      setProcessingId(invitationId);
      const response = await api.post("/teams/chatbot-invitations/resend", {
        invitationId,
      });
      if (response.data.success) {
        toast.success("Invitation resent successfully");
        fetchInvitations();
      }
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (invitationId) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?"))
      return;
    try {
      setProcessingId(invitationId);
      const response = await api.delete("/teams/chatbot-invitations/revoke", {
        data: { invitationId },
      });
      if (response.data.success) {
        toast.success("Invitation revoked");
        setOutgoingInvitations((prev) =>
          prev.map((inv) =>
            inv.invitationId === invitationId
              ? {
                  ...inv,
                  status: "REVOKED",
                  revokedAt: new Date().toISOString(),
                }
              : inv,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast.error("Failed to revoke invitation.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* ── Send Invitation ── */}
      <div data-tour="chatbot-invite-form">
        <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-600">
          Send Invitation
        </h3>
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This invitation is for <strong>this chatbot only</strong>. To add
            someone across all chatbots at once, invite them from the{" "}
            <strong>Account Members</strong> page instead.
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-3 xl:flex-row">
          <Input
            placeholder="Enter an email address..."
            className="flex-1 border-gray-300 shadow-sm focus-visible:ring-blue-500"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                data-tour="chatbot-invite-role"
                className="w-full justify-between border-gray-300 bg-white font-normal text-gray-700 shadow-sm hover:bg-gray-50 xl:w-[140px]"
              >
                {ROLES.find((r) => r.value === inviteRole)?.label || "Agent"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px] p-2" align="end">
              {ROLES.map((role) => {
                const currentUserLevel = ROLE_LEVEL[selectedChatbot?.userRole] ?? -1;
                const isDisabled = ROLE_LEVEL[role.value] > currentUserLevel;
                return (
                  <DropdownMenuItem
                    key={role.value}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) setInviteRole(role.value);
                    }}
                    className={`mb-1 rounded-md p-2 last:mb-0 ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${inviteRole === role.value ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className={`font-semibold sm:text-sm ${isDisabled ? "text-gray-400" : "text-blue-600"}`}>
                        {role.label}
                      </div>
                      <div className="text-muted-foreground text-xs leading-relaxed whitespace-normal">
                        {role.description}
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <GatedAction>
            <Button
              className="w-full bg-blue-500 px-6 font-semibold text-white shadow-sm hover:bg-blue-600 xl:w-auto"
              onClick={handleSendInvite}
              disabled={sending || atLimit}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Invite"
              )}
            </Button>
          </GatedAction>
        </div>
      </div>

      {/* ── Outgoing Invitations ── */}
      <div className="flex-1">
        <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-600">
          Outgoing Invitations (Sent by you)
        </h3>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : outgoingInvitations.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 italic">
            No outgoing invitations.
          </div>
        ) : (
          <div className="mt-2 divide-y divide-gray-50">
            {outgoingInvitations.map((inv) => {
              const isProcessing = processingId === inv.invitationId;
              return (
                <div
                  key={inv.invitationId}
                  className="flex flex-col justify-between gap-2 py-3 xl:flex-row xl:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                      {inv.inviteeEmail}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[inv.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                      <div>
                        <span className="font-semibold text-gray-600">
                          Role:
                        </span>{" "}
                        {ROLES.find((r) => r.value === inv.role)?.label ||
                          inv.role}
                        {inv.chatbotName && (
                          <>
                            {" "}·{" "}
                            <span className="font-semibold text-gray-600">
                              Chatbot:
                            </span>{" "}
                            {inv.chatbotName}
                          </>
                        )}
                      </div>
                      <div>
                        {inv.accountName && (
                          <>
                            <span className="font-semibold text-gray-600">
                              Account:
                            </span>{" "}
                            {inv.accountName} ·{" "}
                          </>
                        )}
                        <span className="font-semibold text-gray-600">
                          Sent:
                        </span>{" "}
                        {new Date(inv.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        <span className="font-semibold text-gray-600">
                          Expires:
                        </span>{" "}
                        {new Date(inv.expiresAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {inv.acceptedAt && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-semibold text-gray-600">
                              Accepted:
                            </span>{" "}
                            {new Date(inv.acceptedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                        {inv.revokedAt && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-semibold text-gray-600">
                              Revoked:
                            </span>{" "}
                            {new Date(inv.revokedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {inv.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleResend(inv.invitationId)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-500 transition-colors hover:text-blue-700 hover:underline"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Resend
                          </button>
                          <button
                            onClick={() => handleRevoke(inv.invitationId)}
                            className="flex items-center gap-1 text-xs font-medium text-red-400 transition-colors hover:text-red-600 hover:underline"
                          >
                            <X className="h-3 w-3" />
                            Revoke
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const IncomingInvitations = () => {
  const { user } = useAuth();
  const [incomingInvitations, setIncomingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const incomingRes = await api.get(
        "/teams/chatbot-invitations/incoming",
      );
      if (incomingRes.data.success) {
        const incData = incomingRes.data.data;
        if (incData?.invitations && Array.isArray(incData.invitations)) {
          setIncomingInvitations(incData.invitations);
        } else if (incData?.invitationId) {
          setIncomingInvitations([incData]);
        } else {
          setIncomingInvitations([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch incoming invitations:", error);
      toast.error("Failed to fetch incoming invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (token, invitationId) => {
    try {
      setProcessingId(invitationId);
      const response = await api.post("/teams/chatbot-invitations/accept", {
        inviteToken: token,
      });
      if (response.data.success) {
        toast.success("Invitation accepted successfully");
        fetchInvitations();
      }
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      toast.error("Failed to accept invitation.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* ── Incoming Invitations ── */}
      <div className="flex-1">
        <h3 className="border-b border-gray-100 pb-2 text-sm font-semibold text-gray-600">
          Incoming Invitations (Received)
        </h3>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : incomingInvitations.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400 italic">
            No incoming invitations.
          </div>
        ) : (
          <div className="mt-2 divide-y divide-gray-50">
            {incomingInvitations.map((inv) => {
              const isProcessing = processingId === inv.invitationId;
              return (
                <div
                  key={inv.invitationId || inv.token}
                  className="flex flex-col justify-between gap-2 py-3 xl:flex-row xl:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                      {inv.chatbotName ? `${inv.chatbotName} (${inv.accountName})` : inv.accountName || "Invitation"}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[inv.status || "PENDING"] || "bg-yellow-100 text-yellow-700"}`}
                      >
                        {inv.status || "PENDING"}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                      <div>
                        <span className="font-semibold text-gray-600">
                          Role:
                        </span>{" "}
                        {ROLES.find((r) => r.value === inv.role)?.label ||
                          inv.role ||
                          "Agent"}
                        {inv.chatbotName && (
                          <>
                            {" "}·{" "}
                            <span className="font-semibold text-gray-600">
                              Chatbot:
                            </span>{" "}
                            {inv.chatbotName}
                          </>
                        )}
                      </div>
                      <div>
                        {inv.inviterName && (
                          <>
                            <span className="font-semibold text-gray-600">
                              Invited by:
                            </span>{" "}
                            {inv.inviterName} ({inv.inviterEmail}) ·{" "}
                          </>
                        )}
                        {inv.createdAt && (
                          <>
                            <span className="font-semibold text-gray-600">
                              Received:
                            </span>{" "}
                            {new Date(inv.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                        {inv.expiresAt &&
                          (!inv.status || inv.status === "PENDING") && (
                            <>
                              {" "}
                              ·{" "}
                              <span className="font-semibold text-gray-600">
                                Expires:
                              </span>{" "}
                              {new Date(inv.expiresAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </>
                          )}
                        {inv.acceptedAt && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-semibold text-gray-600">
                              Accepted:
                            </span>{" "}
                            {new Date(inv.acceptedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                        {inv.revokedAt && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-semibold text-gray-600">
                              Revoked:
                            </span>{" "}
                            {new Date(inv.revokedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                        {inv.removedAt && (
                          <>
                            {" "}
                            ·{" "}
                            <span className="font-semibold text-gray-600">
                              Removed:
                            </span>{" "}
                            {new Date(inv.removedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    (!inv.status || inv.status === "PENDING") && (
                      <button
                        onClick={() =>
                          handleAccept(inv.token, inv.invitationId)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-green-600 transition-colors hover:text-green-800 hover:underline"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
