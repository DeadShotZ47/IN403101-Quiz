"use client";

import { FormEvent, useState } from "react";

interface NewStatusFormProps {
  onSubmit: (content: string) => Promise<void> | void;
}

const NewStatusForm = ({ onSubmit }: NewStatusFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("กรุณากรอกข้อความสถานะ");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(content.trim());
      setContent("");
    } catch (submitError) {
      console.error(submitError);
      setError("บันทึกสถานะไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="status-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="อยากบอกอะไรกับเพื่อน ๆ ในรุ่นบ้าง?"
        rows={4}
      />
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "กำลังโพสต์..." : "โพสต์สถานะ"}
        </button>
      </div>
    </form>
  );
};

export default NewStatusForm;
