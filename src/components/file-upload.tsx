"use client";
import React, { useRef, useState, useEffect } from "react";
import { CloudUpload, X } from "lucide-react";
import clsx from "clsx";

interface FileUploadProps {
  endpoint?: string;
  onChange: (file?: File) => void;
  value?: File;
}

const FileUpload: React.FC<FileUploadProps> = ({ onChange, value }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    
    setIsUploading(true);
    setUploadProgress(0);

    const fakeUpload = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(fakeUpload);
          setIsUploading(false);
          setTimeout(() => {
            onChange(file);
          }, 0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <div className="flex flex-col items-center">
      {value && !isUploading && previewUrl ? (
        <div className="relative w-42 h-40">
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-full object-cover rounded-xl border"
          />
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-red-500" />
          </button>
        </div>
      ) : (
        <div
          className={clsx(
            "relative w-52 h-44 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          <CloudUpload
            className={clsx(
              "mx-auto mb-2 text-gray-400 transition-transform",
              isDragging && "scale-105 text-blue-400"
            )}
            size={55}
          />
          <p className="text-xs text-gray-600">
            Drag &amp; drop or{" "}
            <span className="font-semibold text-blue-600 underline">click</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-1">Max file size: 2MB</p>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />

          {isUploading && (
            <div className="mt-4 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
