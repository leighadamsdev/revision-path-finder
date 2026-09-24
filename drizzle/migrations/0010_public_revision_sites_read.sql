GRANT SELECT ON public.revision_sites TO anon;
GRANT SELECT ON public.revision_sites TO authenticated;
DROP POLICY IF EXISTS "read revision sites" ON public.revision_sites;
CREATE POLICY "read revision sites" ON public.revision_sites FOR SELECT TO anon, authenticated USING (true);