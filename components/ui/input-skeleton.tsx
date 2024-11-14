import { Skeleton } from "@/components/ui/skeleton";

export default function InputSkeleton() {
  return (
    <div>
      <Skeleton className="w-32 h-8" />
      <Skeleton className="w-full h-8 mt-2" />
    </div>
  );
}
