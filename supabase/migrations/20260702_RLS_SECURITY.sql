-- Enable RLS on diagnostics table (assuming it exists, otherwise create it)
CREATE TABLE IF NOT EXISTS diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    description TEXT,
    prediction TEXT,
    severity TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can insert
CREATE POLICY "Allow authenticated users to insert diagnostics" 
ON diagnostics FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 2: Users can only view their own diagnostics
CREATE POLICY "Allow users to view own diagnostics" 
ON diagnostics FOR SELECT 
TO authenticated 
USING (user_id = auth.uid()::text);

-- Policy 3: Service role can do everything
CREATE POLICY "Service role can do everything"
ON diagnostics FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
