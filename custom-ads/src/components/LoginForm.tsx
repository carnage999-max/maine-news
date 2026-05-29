"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });

    setLoading(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error || "Unable to sign in.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="loginShell">
      <section className="loginPanel">
        <div className="loginBrand">
          <div className="loginLogo">
            <img src="/se7eninc.png" alt="" />
          </div>
          <div>
            <p className="smallLabel">Ads by Se7enInc</p>
            <h1>Sign in</h1>
          </div>
        </div>

        <p className="loginCopy">
          Manage advertiser placements, priority, delivery rules, and reporting from one protected desk.
        </p>

        <form className="loginForm" onSubmit={submit}>
          <label className="field">
            <span>Username</span>
            <input name="username" autoComplete="username" defaultValue="admin" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          {error ? <div className="loginError">{error}</div> : null}

          <button className="button buttonPrimary" type="submit" disabled={loading}>
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
