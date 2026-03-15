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
import { z } from "zod";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { forgetPasswordSchema } from "@/schema/auth";
import { forgetPasswordApiCall } from "@/lib/auth";
import { useDispatch } from "react-redux";
import { forgetPasswordRequestFailure, forgetPasswordRequestSuccess } from "@/redux/slices/auth-slice";



type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

const ForgetPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm<ForgetPasswordFormValues>({


    resolver: zodResolver(forgetPasswordSchema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgetPasswordFormValues) => {
    setLoading(true);

    try {
      const result = await forgetPasswordApiCall(data.email);

      if (result.success) {
        dispatch(forgetPasswordRequestSuccess({}));
        localStorage.setItem("resetPasswordEmail", data.email);
        toast.success("Recovery instructions sent!");
        router.replace("/reset-password");
      } else {
        dispatch(forgetPasswordRequestFailure(result.error));
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      label="We'll send you recovery link"
      title="Reset Password"
      backButtonHref="/login"
      backButtonLabel="Back to Secure Login"
      cardClassName="border hover:border-white/20 transition-colors duration-500"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">Registered Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="alex@example.com"
                    disabled={loading}
                    className="h-12 bg-white/5 text-white border-white/10 rounded-xl focus:border-white/20 transition-all placeholder:text-zinc-600 px-4"
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "Sending link..." : "Send Recovery Link"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ForgetPasswordForm;
