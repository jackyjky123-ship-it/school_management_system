import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoSwitcher } from "./components/DemoSwitcher";
import { GraduationCap, Lock, Mail, Loader2, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const navigate = useNavigate();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const user = await login(data);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "teacher") navigate("/teacher");
      else navigate("/student");
    } catch (err: any) {
      if (err.response?.data?.errors?.email) {
        setServerError(err.response.data.errors.email[0]);
      } else {
        setServerError(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 sm:p-8">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white/90 px-2.5 text-xs text-slate-600 shadow-2xs backdrop-blur-xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
          )}
          <span className="hidden sm:inline font-medium">{isDark ? "Light" : "Dark"}</span>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Academia Portal
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Institutional Academic & School Management Platform
          </p>
        </div>

        <Card className="border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-semibold">Sign in to your account</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Select an instant demo persona or enter your credentials below
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* 1-Click Demo Reviewer Buttons */}
            <DemoSwitcher />

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white px-2.5 text-[11px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                Or continue with email
              </span>
            </div>

            {serverError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.test"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="pl-9 h-9 text-sm"
                    {...register("email", {
                      onChange: () => setServerError(null),
                    })}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-rose-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="px-9 h-9 text-sm"
                    {...register("password", {
                      onChange: () => setServerError(null),
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-rose-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-9 text-sm transition-colors"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Demo Passwords default to{" "}
          <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-mono">
            password
          </code>
        </p>
      </div>
    </div>
  );
};
