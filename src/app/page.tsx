"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import "./home.css";

const HomePage = () => {
  const { token, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="home-shell">
      <section className="home-hero">
        <div className="home-hero-top">
          <span className="home-pill">พร้อมเชื่อมต่อเพื่อนร่วมรุ่น</span>
          {token ? (
            <button type="button" className="home-top-login" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          ) : (
            <Link href="/login" className="home-top-login">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
        <h1>
          Classroom Community
          <span> สร้างพื้นที่เดียวสำหรับรุ่นของคุณ</span>
        </h1>
        <p>
          เข้าสู่ระบบเพื่อเข้าถึงข้อมูลโปรไฟล์ของคุณ สำรวจรายชื่อเพื่อนในรุ่น และติดตามบรรยากาศในฟีดสถานะได้แบบเรียลไทม์
        </p>
      </section>

      <section className="home-cards">
        <article className="home-card">
          <header>
            <h2>ดูสมาชิกชั้นปี</h2>
            <p>เลือกปีที่เข้าศึกษาเพื่อดูรายชื่อ ข้อมูลสาขา และโรงเรียนเดิมของเพื่อน</p>
          </header>
          <Link href="/classroom/2023">สำรวจชั้นปี</Link>
        </article>

        <article className="home-card">
          <header>
            <h2>ฟีดสถานะ</h2>
            <p>อัปเดตความเคลื่อนไหว โพสต์ แสดงความคิดเห็น และกดถูกใจได้ในทันที</p>
          </header>
          <Link href="/feed">เข้าสู่ฟีด</Link>
        </article>

        {token ? (
          <article className="home-card">
            <header>
              <h2>ดูโปรไฟล์ของฉัน</h2>
              <p>ตรวจสอบและจัดการข้อมูลส่วนตัว รายละเอียดการศึกษา และสถานะบัญชี</p>
            </header>
            <Link href="/profile">ไปที่โปรไฟล์</Link>
          </article>
        ) : null}
      </section>
    </main>
  );
};

export default HomePage;
