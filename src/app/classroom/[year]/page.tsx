"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import MemberCard, { ClassroomMember } from "@/components/MemberCard";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

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
  const { token } = useAuth();

  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const response = await apiFetch<ClassroomResponse>(
          `/class/${year}`,
          { token },
        );
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

  return (
    <main className="page-container classroom-page">
      <header className="section-header">
        <h1>{title}</h1>
        <p>
          ตรวจสอบรายชื่อเพื่อนร่วมรุ่น พร้อมข้อมูลสาขา รหัสนักศึกษา และโรงเรียนเดิม
        </p>
      </header>

      {!token ? (
        <div className="info-banner">
          <p>
            กรุณา <Link href="/login">เข้าสู่ระบบ</Link> ก่อนเพื่อดูรายชื่อชั้นปี
            {" "}
            <strong>{year}</strong>
          </p>
        </div>
      ) : null}

      {token ? (
        <section className="classroom-content" aria-live="polite">
          {isLoading ? (
            <p className="loading-text">กำลังดึงข้อมูล...</p>
          ) : error ? (
            <p className="form-error">{error}</p>
          ) : members.length === 0 ? (
            <p className="empty-text">ยังไม่มีข้อมูลสมาชิกในชั้นปีนี้</p>
          ) : (
            <div className="classroom-grid">
              {members.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <footer className="section-footer">
        <span>เลือกปีอื่น:</span>
        <div className="year-links">
          {["2021", "2022", "2023", "2024", "2025"].map((item) => (
            <Link key={item} href={`/classroom/${item}`}>
              {item}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default ClassroomYearPage;
