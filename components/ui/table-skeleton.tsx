import { Skeleton } from "./skeleton";

export default function TableSkeleton() {
  return (
    <div className="table w-full">
      <div className="table-header flex gap-2">
        <Skeleton className="w-1/2 h-[40px] " />
        <Skeleton className="w-1/2 h-[40px]" />
      </div>
      <div className="table-body">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex gap-2">
            <Skeleton className="w-1/2 h-[40px] mt-2" />
            <Skeleton className="w-1/2 h-[40px] mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
