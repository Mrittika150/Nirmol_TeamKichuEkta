-- Read-only check after steps 1-6. Every row should say ok = true.
select 'table ' || t as item, to_regclass('public.' || t) is not null as ok
from unnest(array['profiles','stations','air_readings','forecast_runs','forecast_points',
                  'pollution_reports','report_reviews','advisor_usage','account_settings']) as t
union all
select 'schema ' || s, exists(select 1 from pg_namespace where nspname = s)
from unnest(array['nirmol_reporting','nirmol_advisor']) as s
union all
select 'forecast publisher function',
       exists(select 1 from pg_proc where proname = 'publish_nirmol_forecast')
union all
select 'private photo bucket',
       exists(select 1 from storage.buckets where id = 'nirmol-report-images' and public = false)
union all
select 'category value "uncertain"',
       exists(select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
              where t.typname = 'report_category' and e.enumlabel = 'uncertain');
