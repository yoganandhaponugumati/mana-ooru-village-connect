-- ============================================================================
-- 20260722120000_add_fcm_token_to_profiles.sql
-- Adds fcm_token column to profiles table to store Firebase Cloud Messaging (FCM)
-- tokens for targeted mobile & desktop push notifications.
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
