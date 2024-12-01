"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useContext } from "react";
import axios from "@/app/api/axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import TableSkeleton from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/components/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { set } from "react-hook-form";

export default function TrackerPage() {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImageSend, setLoadingImageSend] = useState<boolean>(false);
  const [calories, setCalories] = useState<{
    ingredients: { name: string; calorie: number }[];
    total_calories: number;
  } | null>(null);

  const { user, fetchUserData, caloriesToday, targetCalories, loading } =
    useContext(AuthContext);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("file", file);

      setLoadingImageSend(true);

      axios
        .post("/detect-calorie", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setLoadingImageSend(false);
          setCalories(response.data);
          if (Array.isArray(response.data)) {
            console.log(response.data[0]);
            setCalories(response.data[0]);
          } else {
            if (response.data.Calories) {
              setCalories(response.data.Calories[0]);
            } else {
              setCalories(response.data);
            }
          }
        })
        .catch((error) => {
          setLoadingImageSend(false);
          console.error(error);
        });
    }
  };

  const saveCalories = async () => {
    await addDoc(
      collection(db, "user_calories", user?.uid ?? "", "user_intakes"),
      {
        calories,
        date: new Date(),
      }
    )
      .then(() => {
        toast({
          variant: "default",
          title: "Success",
          description: "Calories saved successfully",
        });

        if (user) fetchUserData(user);
      })
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save calories",
        });
      });
  };

  return (
    <div className="">
      <div>
        <h2 className="text-xl mb-2">Image Preview:</h2>
        <img
          src={
            selectedImage
              ? selectedImage
              : "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
          }
          alt="Selected"
          style={{ width: "300px", height: "auto", marginTop: "10px" }}
        />
      </div>
      <div className="py-3">
        {" "}
        <Label htmlFor="picture">Picture</Label>
        <Input
          id="picture"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <div className="w-full">
        {loadingImageSend ? (
          <TableSkeleton />
        ) : (
          <>
            {calories && (
              <div className="w-full py-4">
                {calories && (
                  <div>
                    <Table>
                      <TableCaption>Calories</TableCaption>
                      <TableHeader>
                        <TableRow className="text-lg">
                          <TableHead className="w-1/2">Ingredient</TableHead>
                          <TableHead>Calorie</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calories.ingredients.map((ingredient, index) => (
                          <TableRow key={index} className="text-base">
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>{ingredient.calorie}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="text-xl">
                          <TableCell>Total</TableCell>
                          <TableCell>{calories.total_calories}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                )}

                {calories.total_calories + (caloriesToday ?? 0) <=
                  (targetCalories ?? 0) && (
                  <div>
                    <Button
                      onClick={() => {
                        saveCalories();
                      }}
                    >
                      Save Calories
                    </Button>
                  </div>
                )}

                {calories.total_calories + (caloriesToday ?? 0) >
                  (targetCalories ?? 0) && (
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline"> Save Calories</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Warning</DialogTitle>
                        <DialogDescription>
                          You are about to exceed more calories than your daily
                          target by{" "}
                          {calories.total_calories +
                            (caloriesToday ?? 0) -
                            (targetCalories ?? 0)}{" "}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            saveCalories();
                            setOpenDialog(false);
                          }}
                        >
                          Save Anyway
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {/* <Button onClick={() => console.log(caloriesToday, targetCalories)}>
        fds
      </Button> */}
    </div>
  );
}
