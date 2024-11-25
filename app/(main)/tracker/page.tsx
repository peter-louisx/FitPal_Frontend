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

export default function TrackerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImageSend, setLoadingImageSend] = useState<boolean>(false);
  const [calories, setCalories] = useState<{
    ingredients: { name: string; calorie: number }[];
    total_calories: number;
  } | null>(null);

  const { user, fetchUserData } = useContext(AuthContext);
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
              <div className="w-full">
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

                <div>
                  <Button
                    onClick={() => {
                      saveCalories();
                    }}
                  >
                    Save Calories
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
