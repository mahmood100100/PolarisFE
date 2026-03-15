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
import { ResetPasswordSchema } from "@/schema/auth";
import { Input } from "../../ui/input";
import { z } from "zod";
import { Button } from "../../ui/button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { resetPasswordApiCall, resendResetPasswordTokenApiCall } from "@/lib/auth";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

const ResetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [sendingToken, setSendingToken] = useState(false); 
  const router = useRouter();
  const { accessToken, isInitialized } = useSelector((state: RootState) => state.auth);


  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      token: "",
      newPassword: "",
      confirmedNewPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setLoading(true);

    try {
      const email = localStorage.getItem("resetPasswordEmail");

      if (!email) {
        toast.error("Session expired. Please start over.");
        router.replace("/forget-password");
      } else {
        const result = await resetPasswordApiCall(email, data.token, data.newPassword, data.confirmedNewPassword);

        if (!result) {
          toast.success("Identity restored successfully!");
          localStorage.removeItem("resetPasswordEmail");
          router.replace("/login");
        } else {
          throw new Error(result?.error || "Reset failed.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const resendToken = async () => {
    setSendingToken(true);

    try {
      const email = localStorage.getItem("resetPasswordEmail");
      if (!email) return;

      const result = await resendResetPasswordTokenApiCall(email);
      if (result.success) {
        toast.success("New token dispatched!");
      } else {
        toast.error(result.error || "Dispatch failed.");
      }
    } catch (error) {
      toast.error("Connection failed.");
    } finally {
      setSendingToken(false);
    }
  };

  useEffect(() => {
    // 1. Redirect if already authenticated
    if (isInitialized && accessToken) {
      router.replace("/");
      return;
    }

    // 2. Existing logic for reset email check
    const email = localStorage.getItem("resetPasswordEmail");
    if (isInitialized && !email && !accessToken) {
      router.replace("/forget-password");
    }
  }, [isInitialized, accessToken, router]);

  return (
    <CardWrapper
      label="Finalize your new password"
      title="Secure Reset"
      backButtonHref="/login"
      backButtonLabel="Cancel and return to login"
      cardClassName="border hover:border-white/20 transition-colors duration-500"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="token" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">Secret Token</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="text" 
                  placeholder="Enter the code from your email" 
                  className="h-12 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="newPassword" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">New Password</FormLabel>
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
            )} />

            <FormField control={form.control} name="confirmedNewPassword" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-1">Verify Password</FormLabel>
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
            )} />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Updating Identity..." : "Reset Password"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="w-full h-11 bg-transparent text-white border-white/10 hover:bg-white/5 hover:border-white/20 rounded-xl transition-all" 
              onClick={resendToken} 
              disabled={sendingToken}
            >
              {sendingToken ? "Requesting New Token..." : "Resend Token"}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetPasswordForm;
