"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import MemberCard, { ClassroomMember } from "@/components/MemberCard";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import "../classroom.css";

interface ClassroomResponse {
  data: ClassroomMember[];
}

interface ClassroomPageProps {
  params: {
    year: string;
  };
}

const ClassroomYearPage = ({ params }: ClassroomPageProps) => {
  const { year } = params;
  const router = useRouter();
  const { token } = useAuth();

  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputYear, setInputYear] = useState<string>(year);

  useEffect(() => {
    setInputYear(year);
  }, [year]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch<ClassroomResponse>(`/class/${year}`, {
          token,
        });
        setMembers(response.data ?? []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("ไม่สามารถดึงข้อมูลชั้นปีได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [token, year]);

  const title = useMemo(() => `รายชื่อชั้นปี ${year}`, [year]);
  const memberCount = members.length;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = inputYear.trim();
    if (!normalized) return;
    router.push(`/classroom/${normalized}`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, "");
    setInputYear(value);
  };

  return (
    <main className="classroom-shell">
      <section className="classroom-hero">
        <div className="classroom-hero-header">
          <h1>{title}</h1>
          <form className="classroom-year-input" onSubmit={handleSubmit}>
            <input
              value={inputYear}
              onChange={handleInputChange}
              placeholder="พ.ศ."
              maxLength={4}
            />
            <button type="submit">เปลี่ยนปี</button>
          </form>
        </div>
        <p>
          ตรวจสอบรายชื่อเพื่อนร่วมรุ่น พร้อมข้อมูลสาขา รหัสนักศึกษา และโรงเรียนเดิมในโทนเดียวกับหน้าแรก
        </p>
        <div className="classroom-hero-actions">
          <span className="classroom-status">
            {token
              ? isLoading
                ? "กำลังโหลดรายชื่อเพื่อนร่วมรุ่น..."
                : `พบทั้งหมด ${memberCount} คน`
              : "เข้าสู่ระบบเพื่อดูรายชื่อเพื่อนร่วมรุ่น"}
          </span>
          <Link href="/">กลับหน้าหลัก</Link>
        </div>
      </section>

      {!token ? (
        <section className="classroom-empty">
          กรุณาเข้าสู่ระบบก่อนเพื่อดูรายชื่อชั้นปี {year}
        </section>
      ) : (
        <section className="classroom-body" aria-live="polite">
          {isLoading ? (
            <p className="classroom-status">กำลังดึงข้อมูล...</p>
          ) : error ? (
            <p className="classroom-error">{error}</p>
          ) : memberCount === 0 ? (
            <div className="classroom-empty">ยังไม่มีข้อมูลสมาชิกในชั้นปีนี้</div>
          ) : (
            <div className="classroom-grid">
              {members.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default ClassroomYearPage;