CREATE TABLE IF NOT EXISTS public.cadre (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code text UNIQUE,
  full_name text NOT NULL,
  surname text,
  father_husband text NOT NULL,
  age integer,
  voter_id text,
  phone text NOT NULL,
  gender text,
  qualification text,
  profession text,
  caste text,
  caste_category text,
  sub_caste text,
  committee_type text NOT NULL,
  committee_level text NOT NULL,
  designation text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  village text,
  district text,
  mandal text,
  ward_no integer,
  photo text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_no integer NOT NULL,
  label text NOT NULL,
  mandal text NOT NULL,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.castes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.sub_castes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caste_id uuid NOT NULL REFERENCES public.castes(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE public.cadre
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS ref_code text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS surname text,
  ADD COLUMN IF NOT EXISTS father_husband text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS voter_id text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS caste text,
  ADD COLUMN IF NOT EXISTS caste_category text,
  ADD COLUMN IF NOT EXISTS sub_caste text,
  ADD COLUMN IF NOT EXISTS committee_type text,
  ADD COLUMN IF NOT EXISTS committee_level text,
  ADD COLUMN IF NOT EXISTS designation text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS village text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS mandal text,
  ADD COLUMN IF NOT EXISTS ward_no integer,
  ADD COLUMN IF NOT EXISTS photo text,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS created_by_name text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.wards
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS ward_no integer,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS mandal text,
  ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

ALTER TABLE public.castes
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

ALTER TABLE public.sub_castes
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS caste_id uuid,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS cadre_created_at_idx ON public.cadre (created_at DESC);
CREATE INDEX IF NOT EXISTS wards_active_mandal_number_idx ON public.wards (active, mandal, ward_no);
CREATE INDEX IF NOT EXISTS sub_castes_caste_sort_idx ON public.sub_castes (caste_id, sort_order, name);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cadre_set_updated_at ON public.cadre;
CREATE TRIGGER cadre_set_updated_at
  BEFORE UPDATE ON public.cadre
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.cadre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.castes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_castes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cadre, public.wards, public.castes, public.sub_castes TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can manage cadre" ON public.cadre;
CREATE POLICY "Authenticated users can manage cadre"
  ON public.cadre FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage wards" ON public.wards;
CREATE POLICY "Authenticated users can manage wards"
  ON public.wards FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage castes" ON public.castes;
CREATE POLICY "Authenticated users can manage castes"
  ON public.castes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage sub-castes" ON public.sub_castes;
CREATE POLICY "Authenticated users can manage sub_castes"
  ON public.sub_castes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
