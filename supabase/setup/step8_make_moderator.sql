-- Run AFTER the person has signed up in the app and confirmed their email.
-- Replace the email below, then run. Only the SQL Editor (database owner) can do this;
-- the app itself blocks users from promoting themselves.
insert into public.profiles (user_id, is_moderator)
select id, true from auth.users where email = 'moderator@example.com'
on conflict (user_id) do update set is_moderator = true;

-- Confirm: should return one row with is_moderator = true.
select u.email, p.is_moderator
from auth.users u join public.profiles p on p.user_id = u.id
where u.email = 'moderator@example.com';
