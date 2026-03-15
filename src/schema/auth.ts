import * as z from 'zod';

export const RegisterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  name: z
    .string()
    .min(1, { message: "Please enter your name" }),
  userName: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 4 * 1024 * 1024,
      "Profile picture must not exceed 2MB"
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      "Only JPEG, PNG, and GIF images are allowed"
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export const LoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const forgetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(6, { message: "Please enter a valid token" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
  confirmedNewPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
}).refine((data) => data.newPassword === data.confirmedNewPassword, {
  message: "Passwords do not match",
  path: ["confirmedNewPassword"],
});

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please enter your name" }),
  userName: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
    image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 2 * 1024 * 1024,
      "Profile picture must not exceed 2MB"
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      "Only JPEG, PNG, and GIF images are allowed"
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
  newPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
  confirmedNewPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .regex(/[A-Z]/, { message: "Password must have at least one uppercase letter" })
    .regex(/\W|_/, { message: "Password must have at least one non-alphanumeric character" }),
}).refine((data) => data.newPassword === data.confirmedNewPassword, {
  message: "Passwords do not match",
  path: ["confirmedNewPassword"],
});
