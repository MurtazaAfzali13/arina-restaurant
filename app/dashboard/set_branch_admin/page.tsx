'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/modules/food/hooks/useAdmin";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  branch_id: number | null;
}

interface Branch {
  id: number;
  name: string;
}

export default function SetBranchAdmin() {
  const { profile, isSuperAdmin, loading: userLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  useEffect(() => {
    if (userLoading) return;
    if (!isSuperAdmin) {
      router.replace("/");
      return;
    }
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        setError(null);

        // دریافت کاربران
        const usersRes = await fetch('/api/users?role=customer');
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setUsers(usersData);

        // دریافت شعبه‌ها
        const branchesRes = await fetch('/api/branches');
        if (!branchesRes.ok) throw new Error('Failed to fetch branches');
        const branchesData = await branchesRes.json();
        setBranches(branchesData);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Failed to load data. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [isSuperAdmin, userLoading, router]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedBranch) {
      alert("Please select both user and branch");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/set_branch_admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: selectedUser, 
          branchId: selectedBranch 
        })
      });
      
      const result = await res.json();
      
      if (res.ok) {
        alert("User successfully updated to Branch Admin");
        // آپدیت لیست کاربران
        setUsers(users.map(user => 
          user.id === selectedUser 
            ? { ...user, role: 'branch_admin', branch_id: selectedBranch }
            : user
        ));
        // ریست فرم
        setSelectedUser('');
        setSelectedBranch(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Network error occurred");
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return <div className="p-4 text-slate-400">Loading user data...</div>;
  if (!isSuperAdmin) return null; // redirect handled in useEffect

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-100">Set Branch Admin</h1>
      
      {fetchLoading ? (
        <div className="text-center py-8 text-slate-400">Loading data...</div>
      ) : error ? (
        <div className="text-red-300 p-4 bg-red-900/20 border border-red-800/50 rounded-xl">{error}</div>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">Select User</label>
              <select 
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-slate-600 rounded-xl bg-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              >
                <option value="">Select User</option>
                {users
                  .filter(user => user.role === 'customer')
                  .map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || 'No Name'} ({user.email})
                    </option>
                  ))
                }
              </select>
              {users.filter(user => user.role === 'customer').length === 0 && (
                <p className="text-sm text-slate-500 mt-1">No regular users found</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-400">Select Branch</label>
              <select 
                value={selectedBranch || ''}
                onChange={e => setSelectedBranch(Number(e.target.value))}
                className="w-full p-2 border border-slate-600 rounded-xl bg-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {branches.length === 0 && (
                <p className="text-sm text-slate-500 mt-1">No branches found</p>
              )}
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading || !selectedUser || !selectedBranch}
              className="w-full bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Updating..." : "Set as Branch Admin"}
            </button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Current Branch Admins</h2>
            <div className="space-y-2">
              {users
                .filter(user => user.role === 'branch_admin')
                .map(user => (
                  <div key={user.id} className="p-3 border border-slate-600/50 rounded-xl flex justify-between items-center bg-slate-700/30 hover:bg-slate-700/50">
                    <div>
                      <span className="font-medium text-slate-100">{user.full_name || 'No Name'}</span>
                      <span className="text-slate-500 ml-2">({user.email})</span>
                    </div>
                    <span className="bg-emerald-900/40 text-emerald-200 px-2 py-1 rounded-lg text-sm">
                      Branch ID: {user.branch_id}
                    </span>
                  </div>
                ))
              }
              {users.filter(user => user.role === 'branch_admin').length === 0 && (
                <p className="text-slate-500 text-center py-4">No branch admins yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}