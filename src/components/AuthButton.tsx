import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

const AuthButton = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/'); // Redirect to home after sign out
  };

  return user ? (
    <div>
      <span>{user.email}</span>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  ) : (
    <button onClick={handleGoogleSignIn}>Sign in with Google</button>
  );
};

export default AuthButton;
