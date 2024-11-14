"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Your password must be at least 6 characters long.",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      ).then(() => {
        router.push("/");
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid Credentials",
      });
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center ">
      <div className="flex flex-row-reverse max-md:flex-col rounded-lg items-center overflow-hidden border border-gray-200 shadow-md w-[60%] max-md:w-[90%] h-[450px] max-md:h-fit">
        <div className="w-1/2 h-full max-md:w-full">
          <img
            src="https://images-prod.healthline.com/hlcmsresource/images/AN_images/why-a-calorie-is-not-a-calorie-1296x728-feature.jpg"
            alt="logo"
            className="h-full w-full"
          />
        </div>
        <Card className="rounded-none border-0  shadow-none w-1/2 h-fit max-md:w-full">
          <CardHeader>
            <CardTitle className="text-3xl">FitPal</CardTitle>
            <CardDescription>Login</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Login</Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Link href="/sign-up" className="hover:underline">
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
