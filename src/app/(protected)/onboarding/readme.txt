// Run this to re-run the onboarding
UPDATE users
SET onboarding_completed_at = NULL, tour_completed_at = NULL
WHERE email = 'krishnagupta0405+1@gmail.com';

DELETE FROM user_onboarding
WHERE user_id = (SELECT id FROM users WHERE email = 'krishnagupta0405@gmail.com');