"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth, type UserProfile } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

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

      const response = await apiFetch<SignInResponse>(
        "/signin",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      const { token, ...profile } = response.data;
      login(profile, token);
      router.push("/feed");
    } catch (submitError) {
      console.error(submitError);
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container auth-page">
      <header className="section-header">
        <h1>เข้าสู่ระบบ</h1>
        <p>กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ Classroom Community</p>
      </header>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="form-control">
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

        <div className="form-control">
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

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
          <Link className="btn btn-secondary" href="/">
            ย้อนกลับหน้าหลัก
          </Link>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
