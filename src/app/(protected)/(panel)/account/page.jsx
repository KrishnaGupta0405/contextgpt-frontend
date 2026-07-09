"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Mail,
  User,
  Calendar,
  Clock,
  Loader2,
  Monitor,
  Smartphone,
  ShieldAlert,
  Wifi,
  Trash2,
  Chrome,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileAvatar } from "./ProfileAvatar";
import { NotificationPreferences } from "./NotificationPreferences";

const AccountContent = () => {
  const { user, account, login, logout } = useAuth();
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);

  // Sign-in methods state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false);
  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [otpValue, setOtpValue] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    facebookLink: "",
    instagramLink: "",
    linkedinLink: "",
    twitterLink: "",
    youtubeLink: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/users/current-user");
        if (response.data.success) {
          const data = response.data.data;
          setProfileData(data);

          // Pre-fill form data
          setFormData({
            name: data.name || "",
            facebookLink: data.facebook_link || "",
            instagramLink: data.instagram_link || "",
            linkedinLink: data.linkedin_link || "",
            twitterLink: data.twitter_link || "",
            youtubeLink: data.youtube_link || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        const response = await api.get("/auth/sessions");
        if (response.data.success) {
          setSessions(response.data.data?.sessions || []);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setSessionsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const connectError = searchParams.get("connect_error");

    if (connected === "google") {
      toast.success("Google account connected!");
      api
        .get("/users/current-user")
        .then((res) => setProfileData(res.data.data))
        .catch(() => {});
    } else if (connectError) {
      toast.error(
        connectError === "already_linked"
          ? "This Google account is already linked to another account."
          : "Failed to connect Google account. Please try again."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleGoogleConnect = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/google/connect`;
  };

  const handleGoogleDisconnect = async () => {
    try {
      setIsDisconnectingGoogle(true);
      const response = await api.post("/auth/google/disconnect");
      toast.success("Google account disconnected.");
      setProfileData(response.data.data);
      setDisconnectDialogOpen(false);
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      toast.error(
        error?.response?.data?.message || "Failed to disconnect Google account."
      );
    } finally {
      setIsDisconnectingGoogle(false);
    }
  };

  const handlePasswordFormChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      setIsPasswordSubmitting(true);
      const payload = profileData?.hasPassword
        ? { oldPassword, newPassword }
        : { newPassword };

      await api.post("/auth/change-password", payload);

      if (profileData?.hasPassword) {
        toast.success("Password updated successfully.");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.success("Password set successfully.");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        const response = await api.get("/users/current-user");
        setProfileData(response.data.data);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update password."
      );
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      setRevokingSessionId(sessionId);
      const response = await api.post("/auth/revoke-session", { sessionId });
      if (response.data.success) {
        toast.success("Session revoked successfully");
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (error) {
      console.error("Error revoking session:", error);
      toast.error("Failed to revoke session.");
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateAccount = async (section) => {
    try {
      if (section === "personal") setSavingDetails(true);
      if (section === "social") setSavingLinks(true);

      const payload = { accountId: account?.id };

      // Determine what to send based on the section
      if (section === "personal") {
        payload.name = formData.name;
      } else if (section === "social") {
        payload.facebookLink = formData.facebookLink;
        payload.instagramLink = formData.instagramLink;
        payload.linkedinLink = formData.linkedinLink;
        payload.twitterLink = formData.twitterLink;
        payload.youtubeLink = formData.youtubeLink;
      }

      const response = await api.patch("/users/update-account", payload);

      if (response.data.success) {
        toast.success(
          section === "personal"
            ? "Personal details updated!"
            : "Social links updated!",
        );

        const updatedData = response.data.data;
        // Map camelCase response to snake_case state if needed
        setProfileData((prev) => ({
          ...prev,
          name: updatedData.name,
          facebook_link: updatedData.facebookLink,
          instagram_link: updatedData.instagramLink,
          linkedin_link: updatedData.linkedinLink,
          twitter_link: updatedData.twitterLink,
          youtube_link: updatedData.youtubeLink,
        }));

        // Sync name with global auth context
        if (section === "personal" && user) {
          login({ ...user, name: updatedData.name }, account);
        }
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(
        `Failed to update ${section === "personal" ? "details" : "links"}.`,
      );
    } finally {
      if (section === "personal") setSavingDetails(false);
      if (section === "social") setSavingLinks(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteStep(1);
    setOtpValue("");
    setDeleteDialogOpen(true);
  };

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      const response = await api.post("/users/delete-account/send-otp");
      if (response.data.success) {
        toast.success("OTP sent to your email address.");
        setDeleteStep(2);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.message || "Failed to send OTP. Try again.",
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      const response = await api.delete("/users/delete-account", {
        data: { otp: otpValue },
      });
      if (response.data.success) {
        setDeleteDialogOpen(false);
        toast.success("Account deleted successfully. Goodbye!");
        logout();
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to delete account.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 container mx-auto max-w-5xl space-y-8 px-4 py-8 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column - Profile Card */}
        <div className="space-y-6 md:col-span-1">
          <Card className="border shadow-sm">
            <CardContent className="flex flex-col items-center pt-6 text-center">
              <ProfileAvatar
                profileData={profileData}
                user={user}
                account={account}
                loading={loading}
                login={login}
                setProfileData={setProfileData}
              />
            </CardContent>

            <div className="px-6 pt-0 pb-6">
              <div className="mt-6 space-y-4 border-t pt-4">
                <div className="text-muted-foreground flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    Joined:{" "}
                    {loading ? (
                      <Skeleton className="ml-2 inline-block h-4 w-24 align-middle" />
                    ) : (
                      formatDate(
                        profileData?.createdAt || profileData?.created_at,
                      )
                    )}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    Updated:{" "}
                    {loading ? (
                      <Skeleton className="ml-2 inline-block h-4 w-24 align-middle" />
                    ) : (
                      formatDate(
                        profileData?.updatedAt || profileData?.updated_at,
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Details and Socials */}
        <div className="space-y-6 md:col-span-2">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    Full Name
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    Email Address
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      id="email"
                      value={profileData?.email || ""}
                      disabled
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button
                onClick={() => handleUpdateAccount("personal")}
                disabled={
                  loading ||
                  savingDetails ||
                  formData.name === profileData?.name
                }
              >
                {savingDetails ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Details"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Sign-in Methods Card */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-slate-500" />
                Sign-in Methods
              </CardTitle>
              <CardDescription>
                Manage how you sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google row */}
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Chrome className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Google</p>
                    {loading ? (
                      <Skeleton className="mt-1 h-3 w-32" />
                    ) : profileData?.googleLinked ? (
                      <p className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Connected as {profileData?.email}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>
                {!loading && !profileData?.googleLinked && (
                  <Button variant="outline" size="sm" onClick={handleGoogleConnect}>
                    Connect Google
                  </Button>
                )}
                {!loading && profileData?.googleLinked && profileData?.hasPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDisconnectDialogOpen(true)}
                  >
                    Disconnect
                  </Button>
                )}
              </div>

              {/* Password row */}
              <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-800">
                  {loading
                    ? ""
                    : profileData?.hasPassword
                      ? "Change Password"
                      : "Set Password"}
                </p>

                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <>
                    {profileData?.hasPassword && (
                      <div className="space-y-2">
                        <Label htmlFor="oldPassword">Current Password</Label>
                        <Input
                          id="oldPassword"
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={handlePasswordFormChange}
                          placeholder="Enter current password"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange}
                          placeholder="New password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handlePasswordSubmit}
                        disabled={isPasswordSubmitting}
                      >
                        {isPasswordSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : profileData?.hasPassword ? (
                          "Save Password"
                        ) : (
                          "Set Password"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions Card */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-slate-500" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                These are all the devices currently logged into your account.
                Revoke any session you don't recognise.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessionsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No active sessions found.
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                        {session.deviceInfo
                          ?.toLowerCase()
                          .includes("mobile") ? (
                          <Smartphone className="h-4 w-4" />
                        ) : (
                          <Monitor className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="text-sm font-medium text-slate-800 break-words flex-1">
                            {session.deviceInfo || "Unknown Device"}
                          </p>
                          {session.isCurrent && (
                            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                              <Wifi className="h-3 w-3" /> Current
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {session.ipAddress} &middot; Signed in{" "}
                          {formatDate(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-3 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={revokingSessionId === session.id}
                      >
                        {revokingSessionId === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ShieldAlert className="mr-1.5 h-4 w-4" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Social Profiles</CardTitle>
              <CardDescription>
                Link your social accounts to your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="facebookLink"
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="relative">
                      <Input
                        id="facebookLink"
                        value={formData.facebookLink}
                        onChange={handleChange}
                        placeholder="https://facebook.com/..."
                        className="pr-10"
                      />
                      {formData.facebookLink && (
                        <a
                          href={
                            formData.facebookLink.startsWith("http")
                              ? formData.facebookLink
                              : `https://${formData.facebookLink}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary absolute top-2.5 right-3 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="instagramLink"
                    className="flex items-center gap-2"
                  >
                    <Instagram className="h-4 w-4 text-pink-600" />
                    Instagram
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="relative">
                      <Input
                        id="instagramLink"
                        value={formData.instagramLink}
                        onChange={handleChange}
                        placeholder="https://instagram.com/..."
                        className="pr-10"
                      />
                      {formData.instagramLink && (
                        <a
                          href={
                            formData.instagramLink.startsWith("http")
                              ? formData.instagramLink
                              : `https://${formData.instagramLink}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary absolute top-2.5 right-3 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="linkedinLink"
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="relative">
                      <Input
                        id="linkedinLink"
                        value={formData.linkedinLink}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        className="pr-10"
                      />
                      {formData.linkedinLink && (
                        <a
                          href={
                            formData.linkedinLink.startsWith("http")
                              ? formData.linkedinLink
                              : `https://${formData.linkedinLink}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary absolute top-2.5 right-3 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="twitterLink"
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4 text-sky-500" />
                    Twitter
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="relative">
                      <Input
                        id="twitterLink"
                        value={formData.twitterLink}
                        onChange={handleChange}
                        placeholder="https://twitter.com/..."
                        className="pr-10"
                      />
                      {formData.twitterLink && (
                        <a
                          href={
                            formData.twitterLink.startsWith("http")
                              ? formData.twitterLink
                              : `https://${formData.twitterLink}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary absolute top-2.5 right-3 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="youtubeLink"
                    className="flex items-center gap-2"
                  >
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube
                  </Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="relative">
                      <Input
                        id="youtubeLink"
                        value={formData.youtubeLink}
                        onChange={handleChange}
                        placeholder="https://youtube.com/..."
                        className="pr-10"
                      />
                      {formData.youtubeLink && (
                        <a
                          href={
                            formData.youtubeLink.startsWith("http")
                              ? formData.youtubeLink
                              : `https://${formData.youtubeLink}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-primary absolute top-2.5 right-3 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button
                onClick={() => handleUpdateAccount("social")}
                disabled={loading || savingLinks}
              >
                {savingLinks ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Links"
                )}
              </Button>
            </CardFooter>
          </Card> */}

          {/* Email Notification Preferences */}
          <NotificationPreferences />

          {/* Danger Zone */}
          <Card className="border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="border-t border-red-100 pt-6">
              <Button
                variant="destructive"
                onClick={openDeleteDialog}
                disabled={loading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog — 2-step OTP flow */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deletingAccount) setDeleteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>Read carefully before proceeding.</DialogDescription>
          </DialogHeader>

          {deleteStep === 1 ? (
            <>
              {/* What will be deleted */}
              <div className="space-y-3 py-1">
                <p className="text-sm font-semibold text-slate-700">
                  The following will be permanently deleted:
                </p>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  {[
                    "Your user profile and login credentials",
                    "All workspaces (accounts) you own",
                    "Every chatbot and its trained data (files, S3, Pinecone vectors)",
                    "All uploaded documents and media (ImageKit / S3)",
                    "API keys, sessions, usage history, and logs",
                    "Active subscription — cancelled immediately",
                    "All active add-ons — expired immediately",
                    "All pending invitations sent by you",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 text-red-500">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* No-refund warning */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <strong>No refunds.</strong> Any remaining subscription period or
                  unused add-on credits will be forfeited. There are no exceptions.
                </div>

                <p className="text-sm text-slate-500">
                  This action is{" "}
                  <span className="font-semibold text-red-600">irreversible</span>.
                  We will send a one-time code to your email to confirm.
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={sendingOtp}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP & Continue"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-3 py-1">
                <p className="text-sm text-slate-600">
                  Enter the 6-digit OTP sent to your email address to confirm
                  account deletion.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    disabled={deletingAccount}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Didn't receive it?{" "}
                  <button
                    className="text-red-500 underline hover:text-red-700 disabled:opacity-50"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? "Sending..." : "Resend OTP"}
                  </button>
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteStep(1)}
                  disabled={deletingAccount}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || otpValue.length !== 6}
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Permanently Delete
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Disconnect Google Confirmation Dialog */}
      <Dialog
        open={disconnectDialogOpen}
        onOpenChange={(open) => {
          if (!isDisconnectingGoogle) setDisconnectDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Google Account</DialogTitle>
            <DialogDescription>
              You'll no longer be able to sign in with Google. You can reconnect it
              anytime from this page. You'll still be able to sign in with your
              password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDisconnectDialogOpen(false)}
              disabled={isDisconnectingGoogle}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleGoogleDisconnect}
              disabled={isDisconnectingGoogle}
            >
              {isDisconnectingGoogle ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Account = () => (
  <React.Suspense>
    <AccountContent />
  </React.Suspense>
);

export default Account;
