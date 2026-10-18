-- Generated from supabase/migrations for the hosted Nirmol project. Run steps in order, one per SQL Editor query.
-- F06 only. REVIEW AND DISPOSABLE TEST FIRST. Do not bulk-apply pending migrations.
-- Does not depend on/enable A06 (0002). No existing report is deleted or approved.
alter type public.report_category add value if not exists 'uncertain';
