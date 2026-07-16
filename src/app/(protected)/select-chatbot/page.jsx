"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChatbot } from "@/context/ChatbotContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { getSocket } from "@/lib/socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function SelectChatbotPage() {
  const [accountGroups, setAccountGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChatbotName, setNewChatbotName] = useState("");
  const [newChatbotDescription, setNewChatbotDescription] = useState("");
  const [isCreatingChatbot, setIsCreatingChatbot] = useState(false);

  const { selectChatbot } = useChatbot();
  const { subscription } = useAuth();
  const router = useRouter();

  const hasSubscriptionAccess =
    subscription?.status === "active" || subscription?.status === "trialing";

  // Tear down the embedded widget when the user lands on this page so they
  // aren't interacting with a stale chatbot while selecting a new one.
  // The StandaloneClientWrapper effect will re-inject it once they pick one.
  useEffect(() => {
    const script = document.getElementById("contextgpt-widget-script");
    if (script) script.remove();
    const host = document.getElementById("contextgpt-widget");
    if (host) host.remove();
  }, []);

  // Derive a flat list + the user's own account role for create-button visibility
  const ownAccount = JSON.parse(localStorage.getItem("account") || "{}");
  const ownAccountGroup = accountGroups.find((g) => g.accountId === ownAccount?.id);
  const ownRole = ownAccountGroup?.userRole || null;
  const allChatbots = accountGroups.flatMap((g) =>
    g.chatbots.map((cb) => ({ ...cb, id: cb.chatbotId, userRole: cb.userChatbotRole || g.userRole, accountName: g.accountName }))
  );

  // NO_SUBSCRIPTION users may create exactly 1 demo chatbot; once it exists
  // the create action is disabled until they subscribe.
  const atFreeChatbotLimit = !hasSubscriptionAccess && allChatbots.length >= 1;
  const canCreateChatbot = hasSubscriptionAccess || allChatbots.length === 0;

  const fetchChatbots = async () => {
    setLoading(true);
    try { 
      const response = await api.get("/chatbots/my-chatbots");
      const groups = response.data.data?.accounts || [];
      setAccountGroups(groups);
    } catch (error) {
      console.error("Failed to fetch chatbots", error);
      toast.error("Failed to load chatbots. Please try again.", {
        description: error.response?.data?.message,
        showCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatbots();
  }, []);

  // Listen for real-time role updates pushed by the backend
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleRoleUpdated = (event) => {
      if (event.type === "account") {
        // Update the userRole for the affected account group
        setAccountGroups((prev) =>
          prev.map((g) =>
            g.accountId === event.accountId
              ? { ...g, userRole: event.newRole }
              : g
          )
        );
        const accountLabel = event.accountName || "your account";
        toast.info(`Your role in ${accountLabel} was updated to ${event.newRole}.`, {
          duration: 10000,
        });
      } else if (event.type === "chatbot") {
        // Update the userChatbotRole for the specific chatbot
        setAccountGroups((prev) =>
          prev.map((g) =>
            g.accountId === event.accountId
              ? {
                  ...g,
                  chatbots: g.chatbots.map((cb) =>
                    cb.chatbotId === event.chatbotId
                      ? { ...cb, userChatbotRole: event.newRole }
                      : cb
                  ),
                }
              : g
          )
        );
        const chatbotLabel = event.chatbotName || "a chatbot";
        const accountLabel = event.accountName ? ` (${event.accountName})` : "";
        toast.info(`Your role in ${chatbotLabel}${accountLabel} was updated to ${event.newRole}.`, {
          duration: 10000,
        });
      }
    };

    socket.on("role:updated", handleRoleUpdated);

    return () => {
      socket.off("role:updated", handleRoleUpdated);
    };
  }, []);

  const handleSelect = (chatbot) => {
    // Switch active account if selecting a chatbot from a different account
    if (chatbot.accountId && chatbot.accountId !== ownAccount?.id) {
      const newAccount = { id: chatbot.accountId, name: chatbot.accountName };
      localStorage.setItem("account", JSON.stringify(newAccount));
    }
    selectChatbot({ ...chatbot, userRole: chatbot.userRole });
    console.log("Selected chatbot", chatbot);
    toast.success(`Selected ${chatbot.name}`);
    router.push("/dashboard");
  };

  const handleCreateChatbot = async () => {
    if (!newChatbotName.trim()) {
      toast.error("Chatbot name cannot be empty.");
      return;
    }

    setIsCreatingChatbot(true);
    try {
      const account = JSON.parse(localStorage.getItem("account") || "{}");
      const accountId = account?.id;
      if (!accountId) {
        throw new Error("No account ID found");
      }

      const response = await api.post(
        `/chatbots/account/${accountId}/create-chatbot`,
        {
          name: newChatbotName.trim(),
          description: newChatbotDescription.trim(),
        },
      );

      const newChatbot = response.data.data;
      selectChatbot({ ...newChatbot, id: newChatbot.chatbotId });
      toast.success(`Chatbot "${newChatbot.name}" created successfully!`);
      setShowCreateModal(false);
      setNewChatbotName("");
      setNewChatbotDescription("");
      router.push("/appearance"); // Navigate to the appearance page for the new chatbot
    } catch (error) {
      console.error("Failed to create chatbot", error);
      toast.error("Failed to create chatbot. Please try again.", {
        description: error.response?.data?.message,
        showCloseButton: true,
      });
    } finally {
      setIsCreatingChatbot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Spinner className="size-10 text-blue-600" />
        <p className="text-[16px] font-semibold text-slate-800">
          Hang tight — your dashboard is warming up! 🚀
        </p>
        <p className="text-[13.5px] text-slate-500">
          Fetching your chatbots, just a moment...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 sm:p-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Select a Chatbot
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Choose a chatbot to manage its personality and data.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" onClick={fetchChatbots}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {ownRole && ownRole !== "AGENT" && (
              canCreateChatbot ? (
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Chatbot</DialogTitle>
                      <DialogDescription>
                        Give your new chatbot a name and an optional description.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newChatbotName}
                          onChange={(e) => setNewChatbotName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., My Website Assistant"
                          disabled={isCreatingChatbot}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newChatbotDescription}
                          onChange={(e) =>
                            setNewChatbotDescription(e.target.value)
                          }
                          className="col-span-3"
                          placeholder="e.g., A friendly AI to help visitors navigate my site."
                          rows={4}
                          disabled={isCreatingChatbot}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        disabled={isCreatingChatbot}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        onClick={handleCreateChatbot}
                        disabled={isCreatingChatbot}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isCreatingChatbot ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create Chatbot
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : atFreeChatbotLimit ? (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                          <Plus className="mr-2 h-4 w-4" />
                          Create New
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Start a free trial or choose a plan to create more chatbots.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <a href="/pricing">
                    <Plus className="mr-2 h-4 w-4" />
                    Start Free Trial
                  </a>
                </Button>
              )
            )}
          </div>
        </div>

        {allChatbots.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-2 border-dashed p-20 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="mb-2">No Chatbots Found</CardTitle>
            <CardDescription className="mb-6">
              {ownRole === "AGENT"
                ? "No chatbots are available for you yet. Contact your admin."
                : "You haven't created any chatbots yet. Get started by creating your first one."}
            </CardDescription>
            {ownRole && ownRole !== "AGENT" && (
              canCreateChatbot ? (
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Your First Chatbot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Chatbot</DialogTitle>
                      <DialogDescription>
                        Give your new chatbot a name and an optional description.
                        Both of these can be changed later on.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newChatbotName}
                          onChange={(e) => setNewChatbotName(e.target.value)}
                          className="col-span-3"
                          placeholder="e.g., My Website Assistant"
                          disabled={isCreatingChatbot}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newChatbotDescription}
                          onChange={(e) =>
                            setNewChatbotDescription(e.target.value)
                          }
                          className="col-span-3"
                          placeholder="e.g., A friendly AI to help visitors navigate my site."
                          rows={4}
                          disabled={isCreatingChatbot}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        disabled={isCreatingChatbot}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        onClick={handleCreateChatbot}
                        disabled={isCreatingChatbot}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isCreatingChatbot ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create Chatbot
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <a href="/pricing">Start Free Trial</a>
                </Button>
              )
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            {accountGroups.map((group) => (
              <div key={group.accountId}>
                {accountGroups.length > 1 && (
                  <div className="mb-4 flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-700">
                      {group.accountName}
                    </h2>
                    {/* <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {group.userRole}
                    </span> */}
                  </div>
                )}
                {group.chatbots.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No chatbots in this account yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.chatbots.map((chatbot) => {
                      const mapped = { ...chatbot, id: chatbot.chatbotId, userRole: chatbot.userChatbotRole || group.userRole, accountName: group.accountName };
                      return (
                        <Card
                          key={chatbot.chatbotId}
                          className="group relative cursor-pointer overflow-hidden transition-all hover:border-blue-200 hover:shadow-lg"
                          onClick={() => handleSelect(mapped)}
                        >
                          <div className="absolute top-0 left-0 h-full w-1 bg-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                          <CardHeader>
                            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-xl font-bold text-blue-600 uppercase">
                              {chatbot.name.substring(0, 2)}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle>{chatbot.name}</CardTitle>
                              {chatbot.userChatbotRole && (
                                <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                                  {chatbot.userChatbotRole}
                                </span>
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {chatbot.description ||
                                "Conversational AI agent for your website."}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter className="mt-auto border-t bg-slate-50 py-3">
                            <span className="text-sm font-medium text-blue-600 group-hover:underline">
                              Manage Chatbot →
                            </span>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
