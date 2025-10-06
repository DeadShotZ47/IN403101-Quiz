"use client";

import { FormEvent, useState } from "react";

interface NewCommentFormProps {
  onSubmit: (content: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

const NewCommentForm = ({ onSubmit, isSubmitting }: NewCommentFormProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("กรุณากรอกข้อความคอมเมนต์");
      return;
    }

    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (submitError) {
      console.error(submitError);
      setError("เกิดข้อผิดพลาดในการส่งคอมเมนต์");
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="เขียนคอมเมนต์ตอบกลับโพสต์นี้"
        rows={3}
      />
      {error ? <p className="form-error">{error}</p> : null}
      <button
        className="btn btn-secondary"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "กำลังส่ง..." : "ส่งคอมเมนต์"}
      </button>
    </form>
  );
};

export default NewCommentForm;
