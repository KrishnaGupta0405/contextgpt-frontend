"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldSeparator } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Chrome, Github, Eye, EyeOff } from "lucide-react";
import { CustomBreadcrumb } from "@/components/ui/CustomBreadcrumb";
import api from "@/lib/axios";
import { toast } from "sonner";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const loadingBarRef = React.useRef(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    loadingBarRef.current.continuousStart();
    const toastId = toast.loading("Logging in your account...");
    console.log("data;", data);
    try {
      const response = await api.post("/auth/login", data);
      console.log("Login response:", response);

      // Update global auth state
      const { user, account, subscription } = response.data.data;
      login(user, account, subscription);

      toast.success("Logged in successfully!", {
        id: toastId,
        // description: "Login successfull",
      });
      // can also store the cookie in the localstorage

      // push the router after 2.5 seconds
      setTimeout(() => {
        loadingBarRef.current.complete();
        const callbackUrl = searchParams.get("callbackUrl");
        const safePath = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/select-chatbot";
        router.push(safePath);
      }, 2500);
    } catch (error) {
      loadingBarRef.current.complete();
      console.log("Login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to login";
      toast.error("Login failed", {
        id: toastId,
        description: errorMessage,
      });
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <LoadingIndicator ref={loadingBarRef} />
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1px_1.2fr] md:gap-16">
          {/* Left Column: Branding & Welcome */}
          <div className="flex flex-col items-center space-y-10 py-4 md:items-start">
            <div className="space-y-4 text-center md:text-left">
              <CustomBreadcrumb
                items={[{ label: "Home" }, { label: "Login" }]}
                className="mb-4"
              />
              <div className="flex flex-col items-center space-y-2 md:items-start">
                <Link href="/" className="text-3xl font-bold tracking-tight">
                  Context<span className="text-blue-600">GPT</span>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-muted-foreground max-w-sm text-lg">
                  Enter your credentials to access your account and continue
                  your journey.
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <Separator
            orientation="vertical"
            className="bg-border/50 hidden h-full self-stretch md:block"
          />
          <Separator
            orientation="horizontal"
            className="bg-border/50 w-full md:hidden"
          />

          {/* Right Column: Form */}
          <div className="flex flex-col space-y-8 py-4">
            <div className="grid gap-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      {...register("email")}
                      className={
                        errors.email
                          ? "border-destructive focus-visible:ring-destructive/20"
                          : ""
                      }
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Link
                        href="/forgot-password"
                        className="text-primary text-sm font-medium hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className={cn(
                          "pr-10",
                          errors.password
                            ? "border-destructive focus-visible:ring-destructive/20"
                            : "",
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FieldError errors={[errors.password]} />
                  </Field>

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </FieldGroup>
              </form>

              <FieldSeparator className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Or continue with
              </FieldSeparator>

              <Button
                variant="outline"
                type="button"
                className="bg-background hover:bg-muted h-11 w-full font-medium transition-colors"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/google`;
                }}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>

              <Button
                variant="outline"
                type="button"
                className="bg-background hover:bg-muted h-11 w-full font-medium transition-colors"
                onClick={() => {
                  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/github`;
                }}
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
            </div>

            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginForm />
    </React.Suspense>
  );
}
