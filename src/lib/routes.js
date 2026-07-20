export const ROUTES = {
  Home: "/",
  Login: "/login",
  Signup: "/signup",
  "Forgot Password": "/forgot-password",
  Dashboard: "/dashboard",
  About: "/aboutus",
  Features: "/features",
  Integration: "/integration",
  Pricing: "/pricing",
  "Chat History": "/chat-history",
  "Custom Responses": "/custom-responses",
  "Files Sources": "/files-sources",
  "SDK Advanced": "/installation/sdk-advanced",
  "Website Integration": "/installation/website-integration",
  Leads: "/leads",
  "Text Snippets": "/text-snippets",
  "Website Links": "/website-links",
  Tools: "/tools",
};

// Sidebar/search destinations visible to the AGENT role only.
// Shared by AppSidebar and the search palette so both stay in sync.
export const AGENT_ALLOWED_URLS = [
  "/dashboard",
  "/chat-history",
  "/members",
  "/settings",
];
