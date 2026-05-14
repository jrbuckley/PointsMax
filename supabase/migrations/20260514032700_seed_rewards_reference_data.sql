insert into public.reward_programs (code, name, issuer, point_name, is_active)
values
  (
    'amex_mr',
    'Amex Membership Rewards',
    'American Express',
    'Membership Rewards points',
    true
  ),
  (
    'chase_ur',
    'Chase Ultimate Rewards',
    'Chase',
    'Ultimate Rewards points',
    true
  ),
  (
    'capital_one_miles',
    'Capital One Miles',
    'Capital One',
    'Capital One miles',
    true
  ),
  (
    'citi_ty',
    'Citi ThankYou Points',
    'Citi',
    'ThankYou Points',
    true
  ),
  (
    'cashback',
    'Cash back / statement credit',
    null,
    'cash back',
    true
  )
on conflict (code) do update
set
  name = excluded.name,
  issuer = excluded.issuer,
  point_name = excluded.point_name,
  is_active = excluded.is_active;

insert into public.redemption_methods (code, name, difficulty)
values
  ('cashback', 'Cash back or statement credit', 'easy'),
  ('portal', 'Issuer travel portal', 'easy'),
  ('transfer', 'Transfer partners', 'advanced')
on conflict (code) do update
set
  name = excluded.name,
  difficulty = excluded.difficulty;
