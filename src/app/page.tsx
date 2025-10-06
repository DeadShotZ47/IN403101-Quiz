import Link from "next/link";

const HomePage = () => {
  return (
    <main className="page-container home-page">
      <section className="home-hero">
        <h1>Classroom Community</h1>
        <p>
          แพลตฟอร์มสำหรับนักศึกษาที่จะช่วยให้คุณล็อกอิน ดูรายชื่อเพื่อนร่วมรุ่น
          แชร์สถานะ และพูดคุยกันได้ในที่เดียว
        </p>
      </section>

      <section className="home-grid">
        <Link href="/login" className="home-card">
          <h2>เข้าสู่ระบบ</h2>
          <p>ล็อกอินเพื่อเข้าถึงข้อมูลส่วนตัวและเริ่มใช้งานทุกฟีเจอร์</p>
        </Link>

        <Link href="/classroom/2023" className="home-card">
          <h2>ดูสมาชิกชั้นปี</h2>
          <p>สำรวจเพื่อนร่วมชั้นปี โดยสามารถเลือกปีที่เข้าศึกษาได้</p>
        </Link>

        <Link href="/feed" className="home-card">
          <h2>ฟีดสถานะ</h2>
          <p>โพสต์ แสดงความคิดเห็น และกดถูกใจสถานะจากเพื่อนในรุ่น</p>
        </Link>
      </section>
    </main>
  );
};

export default HomePage;
