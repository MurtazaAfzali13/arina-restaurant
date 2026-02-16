"use client";

import { useEffect, useState } from "react";
import type { PexelsPhoto } from "../page";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GalleryGridProps {
  photos: PexelsPhoto[];
  perPage?: number;
}

export default function GalleryGrid({ photos, perPage = 30 }: GalleryGridProps) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PexelsPhoto | null>(null);
  const [loadingImages, setLoadingImages] = useState(true);

  const totalPages = Math.ceil(photos.length / perPage);
  const startIndex = (page - 1) * perPage;
  const visiblePhotos = photos.slice(startIndex, startIndex + perPage);

  useEffect(() => {
    // نمایش skeleton برای حالت لود شدن
    setLoadingImages(true);
    const timer = setTimeout(() => setLoadingImages(false), 1000);
    return () => clearTimeout(timer);
  }, [page]);

  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <div className="relative w-full max-w-7xl">
      {/* ✅ Grid Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {loadingImages
          ? // 💫 Skeletons (شبیه نمونه رسمی shadcn)
          Array.from({ length: perPage }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col space-y-3 rounded-2xl bg-gray-900 shadow-sm p-2"
            >
              <Skeleton className="h-64 w-full rounded-xl bg-gray-600" />
              <div className="space-y-2 px-2 pb-2">
                <Skeleton className="h-4 w-3/4 bg-gray-600" />
                <Skeleton className="h-4 w-1/2 bg-gray-600" />
              </div>
            </div>
          ))
          : // 🍕 تصاویر اصلی
          visiblePhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelected(photo)}
              className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-md hover:shadow-xl transition-transform duration-500"
            >
              <img
                src={photo.src.large}
                alt={""}
                className="w-full h-64 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition"></div>
            </div>
          ))}
      </div>

      {/* ✅ Responsive Pagination Controls */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mb-10">
          <div className="bg-green-600 rounded-xl p-2 sm:p-3">
            <Pagination>
              <PaginationContent
                className="
            flex flex-col gap-2
            sm:flex-row sm:justify-between sm:items-center
          "
              >
                {/* Previous */}
                <PaginationItem className="flex justify-center sm:justify-start">
                  <PaginationPrevious
                    onClick={handlePrev}
                    className={`
                cursor-pointer text-sm sm:text-base
                ${page === 1 ? "opacity-50 pointer-events-none" : ""}
              `}
                  />
                </PaginationItem>

                {/* Page Info */}
                <span
                  className="
              text-center text-xs sm:text-sm md:text-base
              bg-white rounded-lg px-3 py-1 sm:px-4 sm:py-2
            "
                >
                  Page {page} of {totalPages}
                </span>

                {/* Next */}
                <PaginationItem className="flex justify-center sm:justify-end">
                  <PaginationNext
                    onClick={handleNext}
                    className={`
                cursor-pointer text-sm sm:text-base
                ${page === totalPages ? "opacity-50 pointer-events-none" : ""}
              `}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>


      {/* ✅ Modal (Popup) using shadcn Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-md border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          {selected && (
            <>


              <div className="relative w-full">
                <img
                  src={selected.src.large}
                  alt={selected.alt}
                  className="w-full h-[500px] object-cover rounded-b-3xl"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
