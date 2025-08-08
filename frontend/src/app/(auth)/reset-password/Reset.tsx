"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const code = searchParams.get("oobCode");
    if (!code) {
      setError("Invalid or missing password reset code.");
      setIsVerifying(false);
      return;
    }

    setOobCode(code);

    // Verify the password reset code is valid
    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setMessage(`Reset password for: ${email}`);
        setError(null);
      })
      .catch(() => {
        setError("The password reset link is invalid or has expired.");
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    if (!oobCode) {
      setError("Invalid password reset code.");
      return;
    }

    setIsResetting(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("Password has been reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>

      {isVerifying ? (
        <p>Verifying reset link...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <p className="mb-4">{message}</p>

          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isResetting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
