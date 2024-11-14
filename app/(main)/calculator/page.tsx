"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useContext, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { AuthContext } from "@/components/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import InputSkeleton from "@/components/ui/input-skeleton";

const formSchema = z.object({
  gender: z.string(),
  age: z.coerce.number().min(1),
  weight: z.coerce.number().min(1),
  height: z.coerce.number().min(1),
  activityLevel: z.coerce.number(),
  goal: z.string(),
});

export default function Calculator() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [calories, setCalories] = useState<number | null>(null);
  const [loadingInitForm, setLoadingInitForm] = useState<boolean>(true);
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const activityLevels = [
    {
      value: 1.2,
      label: "No exercise (or very little)",
    },
    {
      value: 1.375,
      label: "Light exercise (1-3 days per week)",
    },
    {
      value: 1.55,
      label: "Moderate exercise (3-5 days per week)",
    },
    {
      value: 1.725,
      label: "Heavy exercise (6-7 days per week)",
    },
    {
      value: 1.9,
      label: "Very heavy exercise (twice per day, extra heavy workouts)",
    },
  ];

  const goals = [
    {
      scale: 0,
      value: "maintain-weight",
      label: "Maintain weight",
    },
    {
      scale: -0.25,
      value: "mild-weight-loss",
      label: "Mild Weight loss (0.25 kg / week)",
    },
    {
      scale: -0.5,
      value: "lose-weight",
      label: "Weight loss (0.5 kg / week)",
    },
    {
      scale: -1,
      value: "extreme-weight-loss",
      label: "Extreme Weight loss (1 kg / week)",
    },
    {
      scale: 0.25,
      value: "mild-weight-gain",
      label: "Mild Weight gain (0.25 kg / week)",
    },
    {
      scale: 0.5,
      value: "gain-weight",
      label: "Weight gain (0.5 kg / week)",
    },
    {
      scale: 1,
      value: "extreme-weight-gain",
      label: "Extreme Weight gain (1 kg / week)",
    },
  ];

  const calculateCalories = (values: z.infer<typeof formSchema>) => {
    let bmr;

    if (values.gender == "male") {
      bmr =
        88.362 +
        13.397 * values.weight +
        4.799 * values.height -
        5.677 * values.age;
    } else {
      bmr =
        447.593 +
        9.247 * values.weight +
        3.098 * values.height -
        4.33 * values.age;
    }

    return Math.round(bmr * values.activityLevel);
  };

  const initCalories = async () => {
    try {
      await setDoc(doc(db, "user_calories", user?.uid ?? ""), {
        calories: calories,
        gender: form.getValues("gender"),
        age: +form.getValues("age")!,
        weight: +form.getValues("weight"),
        height: +form.getValues("height"),
        activityLevel: +form.getValues("activityLevel"),
        goal: form.getValues("goal"),
      }).then(() => {
        toast({
          variant: "default",
          title: "Success",
          description: "Profile saved successfully",
        });
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const initForm = async () => {
    const docRef = doc(db, "user_calories", user?.uid ?? "");

    await getDoc(docRef).then((doc) => {
      if (doc.exists()) {
        form.reset({
          ...doc.data(),
          activityLevel: doc.data().activityLevel.toString(),
        });
        setCalories(doc.data().calories);
      }
      setLoadingInitForm(false);
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setCalories(
      calculateCalories(values) +
        goals.find((g) => g.value === values.goal)?.scale! * 1000
    );
  }

  useEffect(() => {
    if (user) {
      initForm();
    }
  }, [user]);

  return (
    <>
      {loadingInitForm && (
        <div className="flex flex-col gap-4">
          <InputSkeleton />
          <InputSkeleton />
          <InputSkeleton />
          <InputSkeleton />
          <InputSkeleton />
          <InputSkeleton />
          <InputSkeleton />
        </div>
      )}
      {user && !loadingInitForm && (
        <div className="w-full h-full">
          <div>
            <h1 className="text-4xl">Calorie Calculator</h1>
          </div>
          <div className="mt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xl">Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal ">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Female
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your weight..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your age..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your height..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your activity level..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityLevels.map((level) => (
                            <SelectItem
                              key={level.value}
                              value={level.value.toString()}
                            >
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your goal..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goals.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              {goal.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Calculate my calories</Button>
              </form>
            </Form>
          </div>

          {calories && (
            <div className="mt-6">
              <div className="text-center">
                <h2 className="text-4xl">
                  Your recommended daily calorie intake
                </h2>
                <p className="text-5xl mt-2">{calories} kcal</p>
              </div>

              <div className="py-4">
                <div className="w-full mt-4 flex justify-center">
                  <Button onClick={() => initCalories()}>
                    Save to profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
