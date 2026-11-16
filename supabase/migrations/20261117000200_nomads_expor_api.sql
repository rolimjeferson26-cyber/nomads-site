-- Expor o schema "nomads" na API (PostgREST), MANTENDO "public" e "auto"
-- (a Ria Agenda e a Ria Auto dependem deles).
alter role authenticator set pgrst.db_schemas = 'public, auto, nomads';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
