interface EducationInfo {
  major?: string;
  enrollmentYear?: string;
  studentId?: string;
  school?: {
    name?: string;
    province?: string;
    logo?: string;
  };
  schoolProvince?: string | null;
}

export interface ClassroomMember {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  image?: string;
  education?: EducationInfo | null;
  role?: string;
  type?: string;
}

interface MemberCardProps {
  member: ClassroomMember;
}

const MemberCard = ({ member }: MemberCardProps) => {
  const { firstname, lastname, email, education } = member;
  const fullName = `${firstname ?? ""} ${lastname ?? ""}`.trim();
  const major = education?.major ?? "-";
  const studentId = education?.studentId ?? "-";
  const schoolName = education?.school?.name ?? education?.schoolProvince ?? "-";

  return (
    <article className="member-card">
      <div className="member-details">
        <header>
          <h3>{fullName || email}</h3>
          <p className="member-email">{email}</p>
        </header>

        <dl className="member-meta">
          <div>
            <dt>สาขา</dt>
            <dd>{major}</dd>
          </div>
          <div>
            <dt>รหัสนักศึกษา</dt>
            <dd>{studentId}</dd>
          </div>
          <div>
            <dt>โรงเรียนเดิม</dt>
            <dd>{schoolName}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
};

export default MemberCard;
