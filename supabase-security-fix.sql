-- Security Fix: Add search_path to database functions
-- Run this in Supabase SQL Editor to fix the "mutable search_path" warnings

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix prevent_created_at_update function
CREATE OR REPLACE FUNCTION prevent_created_at_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.created_at <> OLD.created_at THEN
        RAISE EXCEPTION 'created_at cannot be modified';
    END IF;
    RETURN NEW;
END;
$$;

-- Verify the fix
SELECT 
    proname as function_name,
    prosecdef as is_security_definer,
    proconfig as search_path_config
FROM pg_proc
WHERE proname IN ('update_updated_at_column', 'prevent_created_at_update');
