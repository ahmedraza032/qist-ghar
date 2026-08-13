"use client";

import React from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AuthOverlayProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthOverlay({ open, onClose, onSuccess }: AuthOverlayProps) {
  const [tab, setTab] = React.useState<"login" | "register">("login");

  // Login fields
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showLoginPw, setShowLoginPw] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);

  // Register fields
  const [regName, setRegName] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [showRegPw, setShowRegPw] = React.useState(false);
  const [regError, setRegError] = React.useState("");
  const [regLoading, setRegLoading] = React.useState(false);
  const [regSuccess, setRegSuccess] = React.useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    setLoginLoading(false);

    if (error) {
      setLoginError(error.message);
      return;
    }

    onSuccess();
    onClose();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: { full_name: regName, phone: regPhone },
      },
    });

    setRegLoading(false);

    if (error) {
      setRegError(error.message);
      return;
    }

    if (data.user && !data.session) {
      setRegSuccess(true);
      return;
    }

    onSuccess();
    onClose();
  }

  const reset = () => {
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setRegName("");
    setRegPhone("");
    setRegEmail("");
    setRegPassword("");
    setRegError("");
    setRegSuccess(false);
  };

  React.useEffect(() => {
    if (open) reset();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-background rounded-lg shadow-xl border border-border p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded hover:bg-muted">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-center mb-6">
          <span className="text-primary">Qist</span>Ghar
        </h2>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setRegSuccess(false); }}
              className={cn(
                "flex-1 pb-3 text-sm font-medium border-b-2 transition-colors",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {loginError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="ol-email">Email</Label>
              <Input id="ol-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ol-password">Password</Label>
              <div className="relative">
                <Input
                  id="ol-password"
                  type={showLoginPw ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-muted text-muted-foreground" tabIndex={-1}>
                  {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => setTab("register")} className="text-primary hover:underline font-medium">
                Create one
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && !regSuccess && (
          <form onSubmit={handleRegister} className="space-y-4">
            {regError && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {regError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="ol-rname">Full Name</Label>
              <Input id="ol-rname" value={regName} onChange={(e) => setRegName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ol-rphone">Phone</Label>
              <Input id="ol-rphone" type="tel" placeholder="03XX XXXXXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ol-remail">Email</Label>
              <Input id="ol-remail" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ol-rpassword">Password</Label>
              <div className="relative">
                <Input
                  id="ol-rpassword"
                  type={showRegPw ? "text" : "password"}
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowRegPw(!showRegPw)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded hover:bg-muted text-muted-foreground" tabIndex={-1}>
                  {showRegPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={regLoading}>
              {regLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => setTab("login")} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Register Success - email confirmation */}
        {tab === "register" && regSuccess && (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Check your email</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Confirmation sent to <strong>{regEmail}</strong>. You can sign in once verified.
              </p>
            </div>
            <Button onClick={() => { setTab("login"); setRegSuccess(false); }} variant="outline" className="w-full">
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
