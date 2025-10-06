import Link from "next/link";

const AppNav = () => {
  return (
    <nav className="app-nav">
      <Link href="/">หน้าหลัก</Link>
      <Link href="/login">เข้าสู่ระบบ</Link>
      <Link href="/feed">ฟีดสถานะ</Link>
      <Link href="/classroom/2023">ชั้นปี 2023</Link>
    </nav>
  );
};

export default AppNav;
