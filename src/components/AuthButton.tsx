import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import styled from 'styled-components';

const AuthContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AuthButtonStyled = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: ${props => props.theme.colors.primaryHover};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const LogoutButton = styled(AuthButtonStyled)`
  background-color: ${props => props.theme.colors.secondary};

  &:hover {
    background-color: ${props => props.theme.colors.secondaryHover};
  }
`;

const AuthButton = () => {
  const user = useUser();
  const supabaseClient = useSupabaseClient();

  const handleLogin = async () => {
    await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <AuthContainer>
      {user ? (
        <UserInfo>
          {user.user_metadata.avatar_url && <Avatar src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name || 'User Avatar'} />}
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </UserInfo>
      ) : (
        <AuthButtonStyled onClick={handleLogin}>Login with Google</AuthButtonStyled>
      )}
    </AuthContainer>
  );
};

export default AuthButton;
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

