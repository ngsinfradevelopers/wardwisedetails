ALTER TABLE public.cadre
  ADD COLUMN IF NOT EXISTS party_affiliation text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cadre_party_affiliation_check'
      AND conrelid = 'public.cadre'::regclass
  ) THEN
    ALTER TABLE public.cadre
      ADD CONSTRAINT cadre_party_affiliation_check
      CHECK (party_affiliation IS NULL OR party_affiliation IN ('Y', 'N', 'O'));
  END IF;
END
$$;
