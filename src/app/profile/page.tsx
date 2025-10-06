"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import "./profile.css";

interface SchoolInfo {
  _id?: string;
  name?: string;
  province?: string;
  logo?: string;
}

interface AdvisorInfo {
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface EducationInfo {
  major?: string;
  enrollmentYear?: string;
  studentId?: string;
  schoolId?: string;
  school?: SchoolInfo;
  advisorId?: string;
  advisor?: AdvisorInfo;
  image?: string;
}

interface ProfileInfo {
  _id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: string;
  role?: string;
  type?: string;
  confirmed?: boolean;
  education?: EducationInfo | null;
  job?: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileResponse {
  data: ProfileInfo;
}

const ProfilePage = () => {
  const { token, profile: cachedProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch<ProfileResponse>("/profile", {
          method: "GET",
          token,
        });
        setProfile(response.data);
      } catch (fetchError) {
        console.error(fetchError);
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const mergedProfile = useMemo<ProfileInfo | null>(() => {
    if (profile) {
      return profile;
    }
    if (cachedProfile) {
      return cachedProfile;
    }
    return null;
  }, [profile, cachedProfile]);

  if (!token) {
    return (
      <main className="profile-shell">
        <section className="profile-empty">
          <p>
            กรุณา <Link href="/login">เข้าสู่ระบบ</Link> ก่อนเพื่อดูข้อมูลโปรไฟล์ของคุณ
          </p>
        </section>
      </main>
    );
  }

  const fullName = [mergedProfile?.firstname, mergedProfile?.lastname].filter(Boolean).join(" ") || "โปรไฟล์ของฉัน";
  const education = mergedProfile?.education;

  return (
    <main className="profile-shell">
      <section className="profile-hero">
        <h1>{fullName}</h1>
        <p>
          ตรวจสอบข้อมูลส่วนตัว รายละเอียดการศึกษา และข้อมูลการติดต่อ เพื่อให้เพื่อนร่วมรุ่นรู้จักคุณมากขึ้น
        </p>
        <div className="profile-actions">
          <span className="profile-meta">
            อัปเดตล่าสุด: {mergedProfile?.updatedAt ? new Date(mergedProfile.updatedAt).toLocaleString("th-TH") : "ไม่ระบุ"}
          </span>
          <Link href="/">กลับหน้าหลัก</Link>
        </div>
      </section>

      {isLoading ? (
        <section className="profile-empty">กำลังโหลดข้อมูล...</section>
      ) : error ? (
        <section className="profile-error">{error}</section>
      ) : mergedProfile ? (
        <section className="profile-grid">
          <article className="profile-card">
            <h2>ข้อมูลพื้นฐาน</h2>
            <dl className="profile-list">
              <div>
                <dt>อีเมล</dt>
                <dd>{mergedProfile.email ?? "-"}</dd>
              </div>
              <div>
                <dt>สถานะ</dt>
                <dd>{mergedProfile.confirmed ? "ยืนยันแล้ว" : "ยังไม่ยืนยัน"}</dd>
              </div>
              <div>
                <dt>บทบาท</dt>
                <dd>{mergedProfile.role ?? "-"}</dd>
              </div>
              <div>
                <dt>ประเภท</dt>
                <dd>{mergedProfile.type ?? "-"}</dd>
              </div>
            </dl>
          </article>

          <article className="profile-card">
            <h2>การศึกษา</h2>
            {education ? (
              <dl className="profile-list">
                <div>
                  <dt>สาขา</dt>
                  <dd>{education.major ?? "-"}</dd>
                </div>
                <div>
                  <dt>ปีการศึกษา</dt>
                  <dd>{education.enrollmentYear ?? "-"}</dd>
                </div>
                <div>
                  <dt>รหัสนักศึกษา</dt>
                  <dd>{education.studentId ?? "-"}</dd>
                </div>
                <div>
                  <dt>โรงเรียนเดิม</dt>
                  <dd>{education.school?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt>จังหวัด</dt>
                  <dd>{education.school?.province ?? "-"}</dd>
                </div>
                {education.advisor ? (
                  <div>
                    <dt>ที่ปรึกษา</dt>
                    <dd>{education.advisor?.name ?? "-"}</dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="profile-meta">ยังไม่มีข้อมูลการศึกษา</p>
            )}
          </article>

          <article className="profile-card">
            <h2>ข้อมูลระบบ</h2>
            <dl className="profile-list">
              <div>
                <dt>รหัสผู้ใช้</dt>
                <dd>{mergedProfile._id}</dd>
              </div>
              <div>
                <dt>สร้างเมื่อ</dt>
                <dd>{mergedProfile.createdAt ? new Date(mergedProfile.createdAt).toLocaleString("th-TH") : "-"}</dd>
              </div>
              <div>
                <dt>ปรับปรุงเมื่อ</dt>
                <dd>{mergedProfile.updatedAt ? new Date(mergedProfile.updatedAt).toLocaleString("th-TH") : "-"}</dd>
              </div>
            </dl>
          </article>
        </section>
      ) : (
        <section className="profile-empty">ไม่พบข้อมูลโปรไฟล์</section>
      )}
    </main>
  );
};

export default ProfilePage;
