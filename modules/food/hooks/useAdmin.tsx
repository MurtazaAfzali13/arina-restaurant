'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserProfile } from '../domain/food.types';

interface UserContextType {
  profile?: UserProfile;
  isBranchAdmin: boolean;
  isSuperAdmin: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  isBranchAdmin: false,
  isSuperAdmin: false,
  isCustomer: false,
  isAdmin: false,
  loading: true,
  refreshProfile: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  const fetchProfile = async () => {
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      setProfile(undefined);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(undefined);
    } else {
      setProfile({
        ...data,
        branch_id: data.branch_id ? Number(data.branch_id) : null
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => fetchProfile());
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        profile,
        isSuperAdmin: profile?.role === 'super_admin',
        isBranchAdmin: profile?.role === 'branch_admin',
        isCustomer: profile?.role === 'customer',
        isAdmin: profile?.role === 'super_admin' || profile?.role === 'branch_admin',
        loading,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
