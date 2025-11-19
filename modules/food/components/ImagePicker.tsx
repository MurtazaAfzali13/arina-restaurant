"use client";
import { useState } from "react";

export default function ImagePicker({ name }: { name: string }) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم عکس نباید بیشتر از 5MB باشد.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-green-500">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 rounded-xl">
          No Image
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        name={name}
        onChange={handleImageChange}
        className="text-gray-300"
      />
    </div>
  );
}
