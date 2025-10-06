"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth, type UserProfile } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import "./login.css";

interface SignInResponse {
  data: UserProfile & { token: string };
}

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบ");
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiFetch<SignInResponse>("/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const { token, ...profile } = response.data;
      login(profile, token);
      router.push("/");
    } catch (submitError) {
      console.error(submitError);
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <h1>เข้าสู่ระบบ Classroom Community</h1>
        <p>
          ยืนยันตัวตนด้วยอีเมลและรหัสผ่านของคุณ เพื่อเข้าถึงฟีเจอร์ครบทุกส่วน ทั้งรายชื่อเพื่อนร่วมรุ่นและฟีดสถานะล่าสุด
        </p>
      </section>

      <section className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-input-group">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="yourname@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <div className="auth-actions">
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
            <Link className="btn btn-secondary" href="/">
              ย้อนกลับหน้าหลัก
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
