"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useContext, useEffect} from "react";
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
import { Loader2Icon} from "lucide-react";
import { totalmem } from "os";

export default function TrackerPage() {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [foodName, setFoodName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingImageSend, setLoadingImageSend] = useState<boolean>(false);
  const [calories, setCalories] = useState<{
    food_name : string,
    ingredients: { name: string; calorie: number }[];
    total_calories: number;
  } | null>(null);

  const { user, fetchUserData, caloriesToday, targetCalories, loading } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFoodName(event.target.value);
  }
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
            setFoodName(response.data[0].food_name);
          } else {
            if (response.data.Calories) {
              setCalories(response.data.Calories[0]);
              setFoodName(response.data.Calories[0].food_name);
            } else {
              setCalories(response.data);
              setFoodName(response.data.food_name);
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
    setIsLoading(true);
    await addDoc(
      collection(db, "user_calories", user?.uid ?? "", "user_intakes"),
      {
        food_name: foodName,
        calories : {
          ...calories,
          total_calories: Number(calories?.total_calories),
        },
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
      })
      .finally(() => {
        setOpenDialog(false);
        setIsLoading(false);
      })
  };


// handle unmatching total calories from gemini
  useEffect(() => {
    let manualTotal = 0;
    if (calories){
      calories?.ingredients.map((ingredient) => {
        manualTotal += Number(ingredient.calorie);
    });
        if (manualTotal != calories?.total_calories) {
                setCalories({
                  ...calories!,
                  total_calories: manualTotal,
                });
          }
    } 
    // console.log("hehe,", calories?.total_calories)
  },[calories])


  useEffect(() => {
    // console.log("terkirim", calories);
    console.log(caloriesToday, targetCalories, calories?.total_calories);
}, [caloriesToday, targetCalories, calories?.total_calories]);


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
        <Label htmlFor="picture">Add food image to detect the calories</Label>
        <Input
        
          id="picture"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border-2 border-gray-500"
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
                      <TableCaption>Calories from the uploaded food image</TableCaption>
                      <TableHeader>
                        <TableRow className="text-lg">
                          <TableHead className="w-1/2">Ingredient</TableHead>
                          <TableHead>Calorie</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        { calories.ingredients &&  calories?.ingredients.map((ingredient, index) => (
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

                  <div className="w-full flex flex-col gap-2">
                    <div>
                      <Label>Food Name</Label>
                      <Input
                        value={foodName}
                        placeholder="Enter food name"
                        onChange={handleInputChange}
                        autoFocus={true}
                      />
                    </div>
                                     
                    {Number(calories.total_calories) + (caloriesToday ?? 0) < (targetCalories ?? 0) && (
                        <Button
                        variant={"default"}
                          disabled={ foodName ? (isLoading ? true : false) : true}
                          onClick={() => {
                            saveCalories();
                          }}
                        >
                          {isLoading ? <Loader2Icon color={"white"} size={25} className="animate-spin" /> : "Save Calories" }
                        </Button>
                        
                    )}
                    
                  </div>

                {Number(calories.total_calories) + (caloriesToday ?? 0) >
                  (targetCalories ?? 0) && (
                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>

                    <DialogTrigger asChild>
                    
                      <div className="w-full flex flex-col mt-2">
                          <Button
                          variant={"default"}
                          disabled={foodName ? false : true}>
                          Save Calories
                        </Button>
                      </div>
                     
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Warning</DialogTitle>
                        <DialogDescription>
                          You are about to exceed more calories than your daily
                          target by{" "}

                          {Number(calories.total_calories) +
                            (caloriesToday ?? 0) -
                            (targetCalories ?? 0)}{" "}

                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          disabled={isLoading ? true : false}
                          variant="outline"
                          onClick={() => {
                            saveCalories();
                          }}
                        >
                          {isLoading ? <Loader2Icon color={"black"} size={25} className="animate-spin" /> : "Save Anyway" }
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
    
    </div>
  );
}
