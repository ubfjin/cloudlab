import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { InfoBanner } from './InfoBanner';

interface UploadPageProps {
  onImageUpload: (imageUrl: string) => void;
}

export function UploadPage({ onImageUpload }: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl mb-8 text-center">구름 사진 업로드</h2>

        <InfoBanner />

        <div className="mt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">사진을 끌어오거나 클릭하여 업로드</h3>
            <p className="text-gray-600 mb-2">PNG, JPG 파일 지원</p>
            <p className="text-base text-blue-500 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full">
              💡 구름의 형태와 분포가 잘 보이도록 넓게 촬영된 사진을 골라주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}