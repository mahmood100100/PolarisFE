import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { RegisterSchema, UpdateUserSchema } from "@/schema/auth";
import { z } from "zod";

type RegisterFormValues = z.infer<typeof RegisterSchema>;

interface ImageUploadFieldProps {
  form: {
    control: Control<RegisterFormValues>;
  };
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ form }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-white">Profile Picture</FormLabel>
          <FormControl>
            <div className="relative flex items-center justify-between p-2 bg-zinc-800 border border-zinc-700 rounded-md h-10">
              <label className="text-sm text-muted-foreground cursor-pointer hover:text-zinc-300 transition">
                Choose Image
                <Input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPreview(URL.createObjectURL(file));
                      field.onChange(file);
                    }
                  }}
                />
              </label>

              {preview && (
                <div className="relative w-8 h-8 shrink-0">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full rounded-full border-2 border-zinc-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      field.onChange(null);
                      setFileInputKey(Date.now());
                    }}
                    className="absolute -top-0.5 -right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-md transition"
                  >
                    <X size={8} />
                  </button>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
};

export default ImageUploadField;
