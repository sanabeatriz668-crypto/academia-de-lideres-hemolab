
INSERT INTO public.profiles (user_id, full_name, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', email), 'admin'
FROM auth.users
WHERE email = 'anabeatriz@hemolabma.com.br'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

UPDATE public.profiles SET role = 'admin'
WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('anabeatriz@hemolabma.com.br','sanabeatriz668@gmail.com'));
