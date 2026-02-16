"use client";

/**
 * Navy-themed skeleton loaders (#1e293b / #243b55).
 * Use for Orders table, Dashboard cards, Menu food cards — no spinners.
 */

const NAVY_BG = "#1e293b";
const NAVY_SURFACE = "#243b55";

export function SkeletonStatCard() {
  return (
    <div
      className="rounded-xl border p-6 animate-pulse transition-shadow hover:shadow-lg"
      style={{ borderColor: NAVY_SURFACE, backgroundColor: "rgba(36, 59, 85, 0.5)" }}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="h-4 w-24 rounded mb-3" style={{ backgroundColor: NAVY_SURFACE }} />
          <div className="h-8 w-16 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
        </div>
        <div className="h-8 w-8 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
      </div>
    </div>
  );
}

export function SkeletonOrdersTableRow() {
  return (
    <tr className="border-b border-[#243b55]/50">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-4 py-3 sm:px-6">
          <div
            className="h-4 rounded animate-pulse"
            style={{ backgroundColor: NAVY_SURFACE, width: i === 2 ? "80%" : "60%" }}
          />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonOrdersTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-xl border shadow-md"
      style={{ borderColor: NAVY_SURFACE, backgroundColor: "rgba(30, 41, 59, 0.4)" }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#243b55]/50" style={{ backgroundColor: "rgba(36, 59, 85, 0.5)" }}>
              {["Order", "Customer", "Date", "Amount", "Status", "Payment", "Delivery", "Actions"].map((label) => (
                <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 sm:px-6">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonOrdersTableRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonFoodCardLarge() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border shadow-md animate-pulse"
      style={{ borderColor: NAVY_SURFACE, backgroundColor: "rgba(30, 41, 59, 0.6)" }}
    >
      <div className="h-56 w-full rounded-t-2xl" style={{ backgroundColor: NAVY_SURFACE }} />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
        <div className="h-4 w-1/3 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
        <div className="h-6 w-24 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
      </div>
    </div>
  );
}

export function SkeletonFoodCardCompact() {
  return (
    <div
      className="animate-pulse rounded-2xl border p-4"
      style={{ borderColor: NAVY_SURFACE, backgroundColor: "rgba(30, 41, 59, 0.6)" }}
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 shrink-0 rounded-xl" style={{ backgroundColor: NAVY_SURFACE }} />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
          <div className="h-3 w-1/2 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
          <div className="h-6 w-20 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonFoodGridLarge({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonFoodCardLarge key={i} />
      ))}
    </div>
  );
}

export function SkeletonFoodGridCompact({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonFoodCardCompact key={i} />
      ))}
    </div>
  );
}

export function SkeletonOrderCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border p-6"
          style={{ borderColor: NAVY_SURFACE, backgroundColor: "rgba(30, 41, 59, 0.6)" }}
        >
          <div className="flex justify-between">
            <div className="h-5 w-32 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
            <div className="h-6 w-24 rounded-full" style={{ backgroundColor: NAVY_SURFACE }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-4 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
            ))}
          </div>
          <div className="mt-4 h-6 w-28 rounded" style={{ backgroundColor: NAVY_SURFACE }} />
        </div>
      ))}
    </div>
  );
}
