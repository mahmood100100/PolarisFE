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
import { LoginSchema } from "@/schema/auth";
import { loginSuccess, loginFailure } from "@/redux/slices/auth-slice";
import { loginApiCall } from "@/lib/auth";
import { useDispatch } from "react-redux";
import BackButton from "../layouts/back-button";
import { Social } from "../social";




type LoginFormValues = z.infer<typeof LoginSchema>;

const LoginForm = () => {
  const [btnLoading, setBtnLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm<LoginFormValues>({

    resolver: zodResolver(LoginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setBtnLoading(true);
    try {
      const result = await loginApiCall(data.email, data.password);

      if (result.success) {
        const { accessToken, user, expiresAt } = result;
        dispatch(loginSuccess({ 
          accessToken, 
          user, 
          expiresAt, 
          provider: "credentials" 
        }));
        toast.success("Login successful!");
        router.replace("/");
      } else {

        dispatch(loginFailure(result.error));
        toast.error(result.error);
      }
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <CardWrapper
      label="Welcome back to Polaris"
      title="Login"
      backButtonHref="/register"
      backButtonLabel="Don't have an account? Register here"
      cardClassName="border hover:border-white/20 transition-colors duration-500"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="e.g. alex@example.com"
                      className="h-12 bg-white/5 text-white border-white/10 rounded-xl focus:bg-white/[0.07] focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all duration-300 placeholder:text-zinc-600 px-4"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-400 text-xs font-bold uppercase tracking-wider ml-1">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      className="h-12 bg-white/5 text-white border-white/10 rounded-xl focus:bg-white/[0.07] focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all duration-300 placeholder:text-zinc-600 px-4"
                    />
                  </FormControl>
                  <div className="flex justify-start px-1">
                    <BackButton
                      href="/forget-password"
                      label="Forgot password?"
                      className="h-auto p-0 text-[11px] text-zinc-500 hover:text-white transition-colors tracking-tight font-medium"
                    />
                  </div>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-white/5 active:scale-[0.98]"
            disabled={btnLoading}
          >
            {btnLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : "Login to Workspace"}
          </Button>
        </form>
      </Form>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="h-[1px] w-full bg-white/10" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold whitespace-nowrap">
          Alternative access
        </span>
        <div className="h-[1px] w-full bg-white/10" />
      </div>

      <div className="mt-6">
        <Social />
      </div>

    </CardWrapper>
  );
};

export default LoginForm;
