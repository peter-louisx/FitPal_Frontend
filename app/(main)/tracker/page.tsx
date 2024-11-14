"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function TrackerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      {selectedImage && (
        <div>
          <h2>Image Preview:</h2>
          <img
            src={selectedImage}
            alt="Selected"
            style={{ width: "300px", height: "auto", marginTop: "10px" }}
          />
        </div>
      )}
      <Label htmlFor="picture">Picture</Label>
      <Input
        id="picture"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
  );
}
