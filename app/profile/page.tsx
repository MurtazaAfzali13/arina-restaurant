'use client';

import { useEffect, useState } from "react";
import { useUser } from "@/modules/food/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/modules/food/domain/food.types";

interface ProfileForm {
    full_name: string;
    phone: string;
}

export default function ProfilePage() {
    const { profile, loading: userLoading } = useUser();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProfileForm>({
        full_name: "",
        phone: ""
    });

    useEffect(() => {
        if (profile) {
            setUserProfile(profile);

            setFormData({
                full_name: profile.full_name || "",
                phone: profile.phone || ""
            });

            setLoading(false);
        } else if (!userLoading) {
            setLoading(false);
        }
    }, [profile, userLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile.id,
                    ...formData
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setSuccess("Profile updated successfully!");

                // به‌روزرسانی محلی بدون خطای تایپی
                setUserProfile(prev =>
                    prev ? { ...prev, ...formData } : prev
                );
            } else {
                setError(result.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (userLoading || loading) {
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view your profile
                    </h2>
                    <p className="text-gray-600">
                        You need to be authenticated to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-8 mt-10">
                    <h1 className="text-3xl font-bold text-gray-100">My Profile</h1>
                    <p className="text-gray-400 mt-2">Manage your account information</p>
                </div>

                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <div className="bg-gray-700 shadow-lg rounded-2xl overflow-hidden">
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-md font-medium text-gray-100 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-500 text-gray-50 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-md font-medium text-gray-100 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.role ?? "N/A"}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-500 text-gray-50 cursor-not-allowed capitalize"
                                    />
                                </div>
                            </div>

                            {(profile.role === 'branch_admin' || profile.role === 'super_admin') &&
                                profile.branch_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-100 mb-2">
                                            Branch ID
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.branch_id}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-500 text-gray-100 cursor-not-allowed"
                                        />
                                    </div>
                                )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="full_name" className="block text-md font-medium text-gray-100 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-100 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-md font-medium text-gray-100 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 text-gray-100 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-600 pt-6">
                                <p className="text-sm text-gray-100">
                                    Account created on:{" "}
                                    {profile.created_at
                                        ? new Date(profile.created_at).toLocaleDateString()
                                        : "Unknown"}
                                </p>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg disabled:bg-blue-400"
                                >
                                    {saving ? "Saving..." : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ProfileSkeleton = () => (
    <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <Skeleton className="h-8 w-48 mx-auto mb-2 bg-gray-700" />
                <Skeleton className="h-4 w-64 mx-auto bg-gray-700" />
            </div>

            <div className="bg-gray-700 shadow-lg rounded-2xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Skeleton className="h-4 w-24 mb-2 bg-gray-600" />
                        <Skeleton className="h-10 w-full bg-gray-600" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-16 mb-2 bg-gray-600" />
                        <Skeleton className="h-10 w-full bg-gray-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Skeleton className="h-4 w-20 mb-2 bg-gray-600" />
                        <Skeleton className="h-10 w-full bg-gray-600" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-28 mb-2 bg-gray-600" />
                        <Skeleton className="h-10 w-full bg-gray-600" />
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <Skeleton className="h-12 w-32 bg-gray-600" />
                </div>
            </div>
        </div>
    </div>
);
