
-- Create profiles table with role system
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('user', 'mitra', 'admin')) NOT NULL DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user specific data
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  address TEXT,
  balance DECIMAL(10,2) DEFAULT 0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- Create mitra specific data
CREATE TABLE public.mitra_profiles (
  mitra_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  service_types TEXT[] DEFAULT '{}',
  profile_image TEXT,
  description TEXT,
  balance DECIMAL(10,2) DEFAULT 0
);

-- Create mitra verifications table
CREATE TABLE public.mitra_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitra_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ktp_image TEXT,
  kk_image TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mitra_id UUID REFERENCES public.profiles(id),
  service_id UUID REFERENCES public.services(id),
  service_name TEXT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  payment_method TEXT CHECK (payment_method IN ('balance', 'cash')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voucher usage table
CREATE TABLE public.voucher_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voucher_id, user_id)
);

-- Create banners table
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create balance transactions table
CREATE TABLE public.balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('topup', 'payment', 'commission', 'voucher', 'withdrawal', 'transfer')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  order_id UUID REFERENCES public.orders(id),
  voucher_id UUID REFERENCES public.vouchers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO public.services (name, description, base_price, duration_minutes) VALUES
('GetMassage - Relaxing', 'Pijat relaksasi untuk menghilangkan stress dan kelelahan', 150000, 60),
('GetMassage - Therapeutic', 'Pijat terapi untuk mengatasi nyeri otot dan sendi', 200000, 90),
('GetClean - Basic', 'Pembersihan rumah dasar meliputi ruang tamu, kamar, dan dapur', 100000, 120),
('GetClean - Deep Clean', 'Pembersihan menyeluruh termasuk jendela, AC, dan area tersembunyi', 180000, 180);

-- Insert default banners
INSERT INTO public.banners (title, image_url, order_index) VALUES
('Selamat Datang di GetLife', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=300&fit=crop', 1),
('GetMassage - Pijat Profesional', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=300&fit=crop', 2),
('GetClean - Bersih Maksimal', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=300&fit=crop', 3),
('Promo Spesial Bulan Ini', 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&h=300&fit=crop', 4),
('Mitra Terpercaya', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=300&fit=crop', 5),
('Layanan 24/7', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=300&fit=crop', 6),
('Kepuasan Terjamin', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=300&fit=crop', 7);

-- Insert sample vouchers
INSERT INTO public.vouchers (code, title, amount, usage_limit, valid_until) VALUES
('WELCOME50', 'Voucher Selamat Datang', 50000, 100, '2024-12-31'),
('CLEAN20', 'Diskon GetClean', 20000, 50, '2024-12-31'),
('MASSAGE30', 'Diskon GetMassage', 30000, 50, '2024-12-31');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitra_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitra_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for user_profiles
CREATE POLICY "Users can manage their own user profile" ON public.user_profiles FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for mitra_profiles
CREATE POLICY "Mitra can manage their own profile" ON public.mitra_profiles FOR ALL TO authenticated USING (auth.uid() = mitra_id);
CREATE POLICY "Users can view active mitra profiles" ON public.mitra_profiles FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can view all mitra profiles" ON public.mitra_profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for mitra_verifications
CREATE POLICY "Mitra can view their own verifications" ON public.mitra_verifications FOR SELECT TO authenticated USING (auth.uid() = mitra_id);
CREATE POLICY "Mitra can insert their own verifications" ON public.mitra_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = mitra_id);
CREATE POLICY "Admins can manage all verifications" ON public.mitra_verifications FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Mitra can view their orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = mitra_id);
CREATE POLICY "Mitra can update their orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = mitra_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for vouchers
CREATE POLICY "Anyone can view active vouchers" ON public.vouchers FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage vouchers" ON public.vouchers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for voucher_usage
CREATE POLICY "Users can view their own voucher usage" ON public.voucher_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create voucher usage" ON public.voucher_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all voucher usage" ON public.voucher_usage FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for banners
CREATE POLICY "Anyone can view active banners" ON public.banners FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages FOR SELECT TO authenticated USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their own messages" ON public.chat_messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Admins can view all messages" ON public.chat_messages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for balance_transactions
CREATE POLICY "Users can view their own transactions" ON public.balance_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create transactions" ON public.balance_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.balance_transactions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);

-- Storage policies for documents
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Storage policies for profiles
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'profiles');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profiles');
CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'user');
  
  -- Create user profile if role is user
  INSERT INTO public.user_profiles (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
