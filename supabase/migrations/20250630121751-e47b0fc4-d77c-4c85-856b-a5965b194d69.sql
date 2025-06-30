
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new policies without recursion issues
CREATE POLICY "Enable read access for users based on user_id" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Also ensure the user_profiles table has proper policies
DROP POLICY IF EXISTS "Users can view own user_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own user_profile" ON public.user_profiles;

CREATE POLICY "Enable read access for user_profiles based on user_id" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable update for user_profiles based on user_id" ON public.user_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users in user_profiles" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);
