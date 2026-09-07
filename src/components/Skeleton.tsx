import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-[#E4E8F1] dark:bg-[#3E3F4E] ${className}`}
  />
);

export const SidebarSkeleton: React.FC = () => (
  <div className="space-y-1" aria-label="Loading boards">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex items-center gap-4 pl-6 md:pl-8 py-3.5">
        <Skeleton className="w-4 h-4 rounded-full shrink-0" />
        <Skeleton className={`h-4 ${index % 2 === 0 ? 'w-32' : 'w-24'}`} />
      </div>
    ))}
  </div>
);

export const BoardSkeleton: React.FC = () => (
  <main
    className="flex-1 overflow-x-auto p-6 flex gap-6 bg-[#F4F7FD] dark:bg-[#20212C] h-full items-start"
    aria-label="Loading board"
  >
    {Array.from({ length: 3 }, (_, columnIndex) => (
      <div key={columnIndex} className="w-70 shrink-0 min-h-[calc(100vh-3rem)] flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-3 h-3 rounded-full" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex min-h-100 flex-1 flex-col gap-5 pb-6">
          {Array.from({ length: 3 }, (_, taskIndex) => (
            <div
              key={taskIndex}
              className="bg-white dark:bg-[#2B2C37] px-4 py-6 rounded-lg shadow-sm"
            >
              <Skeleton className={`h-4 ${taskIndex === 1 ? 'w-3/4' : 'w-5/6'} mb-3`} />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    ))}
    <Skeleton className="w-70 shrink-0 self-stretch mt-8 min-h-100 rounded-md" />
  </main>
);
