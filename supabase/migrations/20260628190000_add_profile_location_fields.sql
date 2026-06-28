ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'villager',
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS mandal TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, account_type, state, district, mandal, village)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'villager'),
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'mandal',
    NEW.raw_user_meta_data->>'village'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    account_type = COALESCE(EXCLUDED.account_type, public.profiles.account_type),
    state = COALESCE(EXCLUDED.state, public.profiles.state),
    district = COALESCE(EXCLUDED.district, public.profiles.district),
    mandal = COALESCE(EXCLUDED.mandal, public.profiles.mandal),
    village = COALESCE(EXCLUDED.village, public.profiles.village),
    updated_at = now();
  RETURN NEW;
END; $$;
