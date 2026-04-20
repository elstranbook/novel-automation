-- Enable RLS on all tables
ALTER TABLE "Template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TemplateLayer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ColorOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Render" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PSDTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BookTemplate" ENABLE ROW LEVEL SECURITY;

-- 1. Policies for Template (Public Read, Admin Write)
CREATE POLICY "Templates are viewable by everyone" 
ON "Template" FOR SELECT 
USING (true);

CREATE POLICY "Templates are editable by service role only" 
ON "Template" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 2. Policies for TemplateLayer (Public Read, Admin Write)
CREATE POLICY "TemplateLayers are viewable by everyone" 
ON "TemplateLayer" FOR SELECT 
USING (true);

CREATE POLICY "TemplateLayers are editable by service role only" 
ON "TemplateLayer" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 3. Policies for ColorOption (Public Read, Admin Write)
CREATE POLICY "ColorOptions are viewable by everyone" 
ON "ColorOption" FOR SELECT 
USING (true);

CREATE POLICY "ColorOptions are editable by service role only" 
ON "ColorOption" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Policies for BookTemplate (Public Read, Admin Write)
CREATE POLICY "BookTemplates are viewable by everyone" 
ON "BookTemplate" FOR SELECT 
USING (true);

CREATE POLICY "BookTemplates are editable by service role only" 
ON "BookTemplate" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 5. Policies for Render (Private by default, can be updated for Auth later)
-- Since no userId is present, we only allow service_role for now to prevent public access
CREATE POLICY "Renders are editable by service role only" 
ON "Render" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 6. Policies for UserImage (Private by default)
CREATE POLICY "UserImages are editable by service role only" 
ON "UserImage" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 7. Policies for PSDTemplate (Private by default)
CREATE POLICY "PSDTemplates are editable by service role only" 
ON "PSDTemplate" FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
