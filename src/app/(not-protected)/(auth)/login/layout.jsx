export const metadata = {
  title: "ContextGPT | Log In",
  description: "Log in to your ContextGPT account to manage your AI chatbots.",
  alternates: { canonical: "https://contextgpt.co/login" },
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Log In",
    description: "Log in to your ContextGPT account.",
    url: "https://contextgpt.co/login",
  },
};

export default function LoginLayout({ children }) {
  return children;
}
