"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { FieldSeparator } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Chrome, Github, Eye, EyeOff, RefreshCw } from "lucide-react";
import { CustomBreadcrumb } from "@/components/ui/CustomBreadcrumb";
import api from "@/lib/axios";
import axios from "axios";
import { toast } from "sonner";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useRouter } from "next/navigation";

// Updated Schema: avatar expects a File object now, not a string
const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(16, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),

  // Validate that avatar is a File object
  avatar: z.custom((value) => value instanceof File, {
    message: "Avatar image is required",
  }),

  terms: z
    .boolean({
      required_error: "Terms and conditions are required",
    })
    .refine(
      (val) => val === true,
      "You must agree to the terms and conditions",
    ),
});

const getInitials = (email) => {
  if (!email || !email.includes("@")) return "??";
  const namePart = email.split("@")[0];
  const parts = namePart.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
};

const DICEBEAR_URL = "https://api.dicebear.com/9.x/adventurer/svg?seed=";

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [seed, setSeed] = React.useState("Aneka");
  const [avatarPreview, setAvatarPreview] = React.useState("");
  const loadingBarRef = React.useRef(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      avatar: undefined, // Default to undefined, we will load file in useEffect
      terms: false,
    },
  });

  const email = watch("email");
  const initials = React.useMemo(() => getInitials(email), [email]);

  const fetchSvg = React.useCallback(
    async (newSeed) => {
      try {
        // 1. Fetch as BLOB instead of string/json
        const response = await axios.get(`${DICEBEAR_URL}${newSeed}`, {
          responseType: "blob",
        });

        // 2. Create a File object from the Blob
        const file = new File([response.data], `avatar-${newSeed}.svg`, {
          type: "image/svg+xml",
        });

        // 3. Set the File in the form state
        setValue("avatar", file, { shouldValidate: true });

        // 4. Create a local URL for the UI to display
        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
      } catch (error) {
        console.error("Error fetching avatar SVG:", error);
      }
    },
    [setValue],
  );

  // Cleanup object URLs to avoid memory leaks
  React.useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const shuffleAvatar = () => {
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
    fetchSvg(newSeed);
  };

  // Fetch initial avatar on mount
  React.useEffect(() => {
    fetchSvg(seed);
  }, [fetchSvg, seed]);

  const onSubmit = async (data) => {
    loadingBarRef.current.continuousStart();
    const toastId = toast.loading("Creating your account...");
    try {
      console.log("Submitting FormData...");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("avatar", data.avatar);
      formData.append("terms", data.terms.toString());

      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Account created! Please check your email.", {
        id: toastId,
        description:
          "We sent a verification link to your email. Click it to activate your account before logging in.",
      });
      console.log("Signup response:", response);

      // Redirect after 2.5 seconds
      setTimeout(() => {
        loadingBarRef.current.complete();
        router.push("/login");
      }, 2500);
    } catch (error) {
      loadingBarRef.current.complete();
      console.log("Signup error from catch tab:", error);
      const errorMessage =
        error.response?.data?.message || "Internal server error.";
      toast.error("Registration failed", {
        id: toastId,
        description: errorMessage,
        closeButton: true,
      });
      console.log("Signup error:", error);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <LoadingIndicator ref={loadingBarRef} />
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1px_1.2fr] md:gap-16">
          {/* Left Column: Branding & Avatar */}
          <div className="flex flex-col items-center space-y-10 py-4 md:items-start">
            <div className="space-y-4 text-center md:text-left">
              <CustomBreadcrumb
                items={[{ label: "Home" }, { label: "Signup" }]}
                className="mb-4"
              />
              <div className="flex flex-col items-center space-y-2 md:items-start">
                <Link href="/" className="text-3xl font-bold tracking-tight">
                  Context<span className="text-blue-600">GPT</span>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">
                  Create an account
                </h1>
                <p className="text-muted-foreground max-w-sm text-lg">
                  Join our community and start building your AI-powered
                  solutions today.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 md:items-start">
              <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                Choose your avatar
              </h3>
              <div className="group relative">
                <Avatar
                  size="xl"
                  className="border-background ring-border group-hover:ring-primary border-4 shadow-xl ring-2 transition-all"
                >
                  {/* Use avatarPreview state here */}
                  <AvatarImage src={avatarPreview} alt="Avatar" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="border-border bg-background hover:bg-muted absolute -right-2 -bottom-2 h-10 w-10 rounded-full border shadow-lg"
                  onClick={shuffleAvatar}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-muted-foreground text-center text-xs md:text-left">
                Nothing provided? We'll use your email initials.
              </p>
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
                  {/* We don't need the hidden input for register("avatar") anymore because we set it manually */}

                  <Field>
                    <FieldLabel htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      {...register("name")}
                      className={
                        errors.name
                          ? "border-destructive focus-visible:ring-destructive/20"
                          : ""
                      }
                    />
                    <FieldError errors={[errors.name]} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">
                      Email address <span className="text-red-500">*</span>
                    </FieldLabel>
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
                    <FieldLabel htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </FieldLabel>
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

                  <Field orientation="horizontal" className="items-start gap-3">
                    <Controller
                      name="terms"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="terms"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className={errors.terms ? "border-destructive" : ""}
                        />
                      )}
                    />
                    <div className="grid gap-1.5 leading-tight">
                      <label
                        htmlFor="terms"
                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the{" "}
                        <Link
                          href="/legal/terms"
                          target="_blank"
                          className="text-primary underline decoration-blue-600 underline-offset-4"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/legal/privacy"
                          target="_blank"
                          className="text-primary underline decoration-blue-600 underline-offset-4"
                        >
                          Privacy Policy
                        </Link>{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <FieldError errors={[errors.terms]} />
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating account..." : "Complete Signup"}
                  </Button>
                </FieldGroup>
              </form>

              <FieldSeparator className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Or join with
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
