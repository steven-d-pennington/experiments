# User Authentication and Management Plan

## 1. Overview

This document outlines the plan to implement user authentication and management using Supabase with Google as the primary OAuth provider. The goal is to allow users to sign up, log in, and have their data associated with their actions, starting with the voting feature. This will serve as the foundation for future user-generated content, such as uploading experiments.

## 2. Key Technologies

- **Next.js:** Application Framework
- **Supabase:** Backend-as-a-Service (Authentication, Database)
- **@supabase/auth-helpers-nextjs:** Supabase library for Next.js integration.
- **TypeScript:** Language for type safety.

## 3. Implementation Steps

### Phase 1: Supabase Configuration & Data Model

1.  **Enable Google Auth Provider:**
    - In the Supabase project dashboard, navigate to **Authentication -> Providers**.
    - Enable and configure the **Google** provider using the credentials from the Google Cloud Console.
      _Note: This step requires manual configuration in the Supabase UI._

2.  **Create `profiles` Table:**
    - Create a new table named `profiles` to store public user data that is safe to expose to the client. This table will be linked to the private `auth.users` table.
    - **SQL for `profiles` table:**

      ```sql
      -- Create the profiles table
      CREATE TABLE public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT,
        avatar_url TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Set up Row Level Security
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
      CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
      CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

      -- Function to create a profile for a new user
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, full_name, avatar_url)
        VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Trigger to execute the function on new user creation
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
      ```

3.  **Update `experiment_votes` Table:**
    - The existing `user_id` column will now be used to store the authenticated user's ID (`auth.uid()`).
    - The `device_id` will be kept as a fallback for anonymous users.

### Phase 2: Client-Side Implementation

1.  **Install Supabase Auth Helpers:**

    ```bash
    npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
    ```

2.  **Create Auth Context:**
    - Create a new file: `src/context/AuthContext.tsx`.
    - This context will provide the user session, profile information, and login/logout functions to the entire application.

3.  **Update `_app.tsx`:**
    - Wrap the main application component with the `AuthContext.Provider` to make the session available on all pages.
    - Initialize the Supabase client here.

### Phase 3: UI Integration

1.  **Create `AuthButton` Component:**
    - Create a new component: `src/components/AuthButton.tsx`.
    - This component will conditionally render:
      - A "Login with Google" button if the user is not authenticated.
      - A user menu with their avatar and a "Logout" button if they are authenticated.

2.  **Add to Layout:**
    - Integrate the `AuthButton` component into the main `src/components/Layout.tsx` so it appears consistently in the site header.

### Phase 4: Feature Integration (Voting)

1.  **Update Voting Logic (`src/lib/voting.ts`):**
    - Modify the `upvote` and `downvote` functions.
    - If a user is logged in, the `user_id` from their session will be sent to the Supabase function.
    - If the user is not logged in, the existing `device_id` logic will be used as a fallback.
    - This ensures that votes are correctly attributed to authenticated users.

## 4. Future Work

- **User Profile Page:** Create a page where users can view and manage their profile.
- **Experiment Uploads:** Build the functionality for authenticated users to upload their own experiments.
- **Role-Based Access:** Introduce roles (e.g., 'admin', 'creator') for more granular control over the application.
