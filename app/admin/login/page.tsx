"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "فشل تسجيل الدخول");
      return;
    }
    router.push("/admin/dashboard");
  }

  return (
    <div className="shell">
      <div className="card form-card" style={{maxWidth:480, margin:'48px auto'}}>
        <h1>تسجيل دخول الإدارة</h1>
        <form onSubmit={login}>
          <label>اسم المستخدم<input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
          <label>كلمة المرور<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error ? <div className="alert error">{error}</div> : null}
          <button className="primary-btn" disabled={loading}>{loading ? "جاري الدخول..." : "دخول"}</button>
        </form>
      </div>
    </div>
  );
}
