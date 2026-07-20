"use client";

// {
//     "statusCode": 200,
//     "data": {
//         "user": {
//             "id": "7dbd4340-2b59-41cd-9f24-efd3555156d0",
//             "email": "krishnagupta0405@gmail.com",
//             "name": "krishna gupta",
//             "avatar": "https://ik.imagekit.io/contextgpt/usersAvatar/0f72fb048f8549c23904d6786a9f455aef29bc76906d94ba1dc0e3841342ee46__eG6kZMsy.svg"
//         },
//         "account": {
//             "id": "09a39f44-2431-47a9-bffb-3a27488cacd2",
//             "name": "krishna gupta's Account",
//             "role": "SUPER_ADMIN"
//         },
//         "subscription": {
        //     "id": "97050557-f02b-4799-8c29-3816d3e85af7",
        //     "status": "active",
        //     "planType": "pri_growth_montly_nt",
        //     "isTrial": false,
        //     "maxChatbotsAllowed": 2,
        //     "maxPagesAllowed": 10000,
        //     "teamMemberAccess": 4,
        //     "apiAccess": true,
        //     "webhookSupport": false, 
        //     "autoScanData": false,
        //     "autoScanDataOccurrence": null,
        //     "autoRefreshData": true,
        //     "autoRefreshDataOccurrence": "monthly",
        //     "platformIntegrationAllowed": false,
        //     "conversationLimit": 20,
        //     "currentPeriodEnd": "2026-07-11 21:28:35.363578-07"
        // },
//         "accessToken": "eyJhbGc...",
//         "refreshToken": "eyJhb...",
//         "sessionId": "41c4dae0-9761-468c-986e-2901d6bbd94d"
//     },
//     "message": "User logged in successfully",
//     "success": true
// }

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import api, { registerLogoutCallback } from "@/lib/axios";
import { getSocket } from "@/lib/socket";
import posthog from "posthog-js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isLoggingOut = useRef(false);

  // Stable logout that can be called from anywhere (including axios interceptor)
  const logout = useCallback(() => {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    // Try to tell the backend to revoke the current session (fire-and-forget)
    api
      .post("/auth/logout")
      .catch(() => {
        // Ignore errors — we're logging out anyway
      })
      .finally(() => {
        setUser(null);
        setAccount(null);
        setSubscription(null);
        localStorage.removeItem("user");
        localStorage.removeItem("account");
        localStorage.removeItem("subscription");
        localStorage.removeItem("selectedChatbot");
        posthog.reset();
        isLoggingOut.current = false;
        router.push("/login");
      });
  }, [router]);

  // Register the logout callback so the axios interceptor can trigger it
  useEffect(() => {
    registerLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    // Rehydrate from localStorage for an instant UI
    const storedUser = localStorage.getItem("user");
    const storedAccount = localStorage.getItem("account");
    const storedSubscription = localStorage.getItem("subscription");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedAccount) {
      setAccount(JSON.parse(storedAccount));
    }
    if (storedSubscription) {
      setSubscription(JSON.parse(storedSubscription));
    }

    // Background session verification — confirms the backend session is still valid
    api
      .get("/users/current-user")
      .then((res) => {
        // Session is valid; keep user data fresh from backend
        const freshUser = res.data?.data;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
          const storedAcct = localStorage.getItem("account");
          const acct = storedAcct ? JSON.parse(storedAcct) : null;
          try {
            posthog.identify(freshUser.id, {
              email: freshUser.email,
              name: freshUser.name,
              account_id: acct?.id,
              account_name: acct?.name,
              account_role: acct?.role,
            });
          } catch (e) {
            console.error("PostHog identify failed:", e);
          }
        }
      })
      .catch((err) => {
        // Only wipe the session on an explicit 401 (invalid/expired token).
        // Network errors, timeouts, or server-down states should not log the user out —
        // the locally-stored session may still be valid once the server comes back.
        if (err?.response?.status === 401) {
          setUser(null);
          setAccount(null);
          setSubscription(null);
          localStorage.removeItem("user");
          localStorage.removeItem("account");
          localStorage.removeItem("subscription");
          localStorage.removeItem("selectedChatbot");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // This event replaces the user object wholesale. Emitters that do not
    // compute tourContext (profile edits, avatar uploads) would otherwise wipe
    // it and leave the dashboard unable to decide which tour is pending, so
    // carry the previous value forward whenever the payload omits it.
    const handleUserUpdated = (payload) => {
      setUser((prev) => {
        const next = payload.user?.tourContext
          ? payload.user
          : { ...payload.user, tourContext: prev?.tourContext };
        localStorage.setItem("user", JSON.stringify(next));
        return next;
      });
    };

    // Billing webhooks ship a recomputed tourContext alongside the subscription
    // — that is what lets a trial start or plan upgrade trigger the matching
    // tour mid-session rather than on the next reload.
    const handleSubscriptionUpdated = (payload) => {
      setSubscription(payload.subscription);
      if (payload.subscription) {
        localStorage.setItem("subscription", JSON.stringify(payload.subscription));
      } else {
        localStorage.removeItem("subscription");
      }

      if (payload.tourContext) {
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, tourContext: payload.tourContext };
          localStorage.setItem("user", JSON.stringify(next));
          return next;
        });
      }
    };

    socket.on("user:updated", handleUserUpdated);
    socket.on("subscription:updated", handleSubscriptionUpdated);

    return () => {
      socket.off("user:updated", handleUserUpdated);
      socket.off("subscription:updated", handleSubscriptionUpdated);
    };
  }, []);

  const login = (userData, accountData, subscriptionData) => {
    setUser(userData);
    setAccount(accountData);
    setSubscription(subscriptionData || null); 
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("account", JSON.stringify(accountData));
    if (subscriptionData) {
      localStorage.setItem("subscription", JSON.stringify(subscriptionData));
    }
    try {
      posthog.identify(userData.id, {
        email: userData.email,
        name: userData.name,
        account_id: accountData?.id,
        account_name: accountData?.name,
        account_role: accountData?.role,
      });
    } catch (e) {
      console.error("PostHog identify failed:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, account, subscription, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
