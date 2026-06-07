# Prisma migration compatibility

The standalone Prisma schema intentionally has no `User` model or `userId`
relation. It can use the existing `dictation_sessions` table even though the
shared Supabase database still enforces its older foreign key to `users`.

The baseline reuses the already-recorded migration name
`20260607094500_add_dictation_sessions`, but its SQL is standalone and therefore
has a different checksum from the old repository migration. Do not deploy or
resolve this baseline against that existing database without first reconciling
the migration history. No SQL in this repository removes the existing foreign
key or otherwise mutates those deployed tables.
