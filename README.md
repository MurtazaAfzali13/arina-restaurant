# Arina Restaurant Management System – Features

**Version:** 1.0  
**Tech Stack:** Next.js 16 (App Router), TypeScript, TailwindCSS, Supabase, SWR, Lucide Icons  

---

## 🎯 Overview

Arina Restaurant Management System is a multi-branch restaurant management platform with role-based access, dashboard analytics, notifications, and real-time updates. It provides:

- Branch-specific food and order management
- Role-based access control (Branch Admin, Super Admin, Users)
- Real-time notifications for new food items
- Optimized data loading with Skeleton loaders
- Navy-themed UI for consistent branding
- Automatic cleanup of expired orders
- SWR caching and revalidation for smooth navigation

---

## 👥 User Roles

| Role           | Access                                                   | Actions Allowed                                        |
|----------------|----------------------------------------------------------|--------------------------------------------------------|
| **Super Admin** | All branches' foods and orders                           | View all, manage any branch's data (read-only for foods in UI cards) |
| **Branch Admin** | Foods and orders of their own branch only               | Add, edit, delete branch-specific foods; manage branch orders |
| **User**        | Own orders                                               | View order status, track progress                     |

---

## 🛠 Core Features

### 1. Food Management
- **Branch-specific Access:** Branch Admin can only see and edit foods of their branch.
- **Super Admin Access:** Can view all foods, read-only.
- **UI Layout:**  
  - Branch Admin: larger, menu-style cards (image top, details below).  
  - Super Admin: compact, table-like cards.  
- **CRUD:** Add, edit, delete branch-specific foods.
- **Validation:** Prevents editing or deleting foods from other branches.

### 2. Dashboard Orders
- **Branch Admin:** Only orders for their branch.
- **Super Admin:** All orders from all branches.
- **Order Status:** Pending, Completed, Cancelled displayed via badges.
- **Date Range Filtering:** Today, Last 7 Days, Last 30 Days, All.
- **Automatic Cleanup:** Orders past end date are automatically removed.

### 3. Analytics & Charts
- **Branch Admin:** Charts show branch-specific metrics.
- **Super Admin:** Charts show global metrics across all branches.
- **Chart Types:** Line charts for revenue, bar charts for order status, KPI cards.

### 4. Notifications
- **Singleton Pattern Service:** Only one notification service instance is active.
- **Branch-specific Notifications:** Users receive alerts only for their branch.
- **Trigger Events:** New food added, branch updates.
- **API Endpoints:** `/api/notifications?branch_id=<id>` for fetching notifications.

### 5. UI & Theme
- **Navy Theme:** Consistent color palette across dashboard and menus (`#1e293b`, `#243b55`).
- **Skeleton Loaders:**  
  - Foods, orders, and user orders use skeleton placeholders while loading.
  - Menu skeleton for loading foods.
- **Responsive Layout:** Works on desktop and mobile.
- **Hover Effects:** Subtle border and shadow effects for interactive elements.

### 6. State Management & Data Loading
- **SWR:** Caching and revalidation on focus/reconnect.
- **Mutate on Edit:** After updating a food item, data refreshes automatically.
- **Preserved State:** Returning to pages shows the latest data without manual refresh.
- **Error Handling:** Display retry buttons if API calls fail.

### 7. Branch & Role Security
- **Branch Restrictions:** Branch Admin cannot access other branches’ data.
- **Row-Level Security (RLS):** Supabase enforces branch-based data access.
- **Session-based Validation:** APIs filter data according to user session and role.

### 8. Menu & My Orders
- **Users:** See their own orders with up-to-date status badges.
- **Branch Managers:** Can view and manage pending orders.
- **Skeleton Loader:** Placeholder cards while loading.
- **Automatic Refresh:** SWR revalidates when returning to the page.

---

## 🔧 Technical Details

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS, navy-themed
- **Database & Auth:** Supabase (RLS enabled)
- **API Calls:** REST routes under `app/api/*`
- **Icons:** Lucide-react
- **Data Fetching:** SWR hooks for caching and auto-refresh
- **Notification System:** Singleton design pattern

---

## ✅ Summary

The system is designed to:

- Support multi-branch management with clear access control.
- Provide real-time updates and notifications.
- Offer a smooth, responsive, and visually consistent UI.
- Ensure data security and proper separation between branches.
- Make dashboard management intuitive for both branch admins and super admins.
- Automatically handle expired orders and live updates in user interfaces.

---

> This file summarizes all major features of the Arina Restaurant Management System for developers, managers, or anyone exploring the project.
