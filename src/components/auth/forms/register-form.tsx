"use client";
import CardWrapper from "../layouts/card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@/schema/auth";
import { Input } from "../../ui/input";
import { z } from "zod";
import { Button } from "../../ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import { registerApiCall } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ImageUploadField from "../layouts/file-upload";
import { Social } from "../social";



type RegisterFormValues = z.infer<typeof RegisterSchema>;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({


    resolver: zodResolver(RegisterSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      name: "",
      userName: "",
      password: "",
      confirmPassword: "",
      image: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("fullName", data.name);
      formData.append("userName", data.userName);
      formData.append("password", data.password);
      if (data.image) {
        formData.append("profileImage", data.image);
      }

      const result = await registerApiCall(formData);

      if (result.success) {
        toast.success("Account created successfully!");
        router.push("/login");
      } else {
        if (Array.isArray(result.error)) {
          result.error.forEach((errorMsg) => {
            if (errorMsg.toLowerCase().includes("email")) {
              form.setError("email", { type: "manual", message: errorMsg });
            }
            if (errorMsg.toLowerCase().includes("username")) {
              form.setError("userName", { type: "manual", message: errorMsg });
            }
          });
        }
        toast.error("Registration failed. Please review the errors.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      label="Join the community"
      title="Create Account"
      backButtonHref="/login"
      backButtonLabel="Already have an account? Login here"
      cardClassName="xl:w-[550px] md:w-[550px] border hover:border-white/20 transition-colors duration-500"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Alex Smith"
                      className="h-11 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="alex_dev"
                      className="h-11 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="col-span-full">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="alex@polaris.com"
                        className="h-11 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="h-11 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">Confirm Identity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="h-11 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="col-span-full">
               <ImageUploadField form={form} />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]" 
            disabled={loading}
          >
            {loading ? "Creating Identity..." : "Complete Registration"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="h-[1px] w-full bg-white/10" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold whitespace-nowrap">
          Or join via
        </span>
        <div className="h-[1px] w-full bg-white/10" />
      </div>

      <div className="mt-6">
        <Social />
      </div>
    </CardWrapper>
  );
};

export default RegisterForm;
