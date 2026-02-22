-- Create the contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  budget NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'funded',
  contract_number TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial seed data
INSERT INTO contracts (title, budget, status, contract_number, expires_at)
VALUES (
  'Next-Gen Design System: Scale Strategy & Orchestration',
  12400.00,
  'funded',
  'SG-9921-A',
  NOW() + INTERVAL '12 days'
);

-- Get the ID of the inserted contract to create logs
DO $$
DECLARE
    contract_id_var UUID;
BEGIN
    SELECT id INTO contract_id_var FROM contracts WHERE contract_number = 'SG-9921-A' LIMIT 1;

    INSERT INTO activity_logs (contract_id, type, title, user_name, created_at)
    VALUES 
    (contract_id_var, 'deposit', 'Funds Deposited', 'Global Corp', NOW() - INTERVAL '1 day'),
    (contract_id_var, 'contract', 'Contract Signed', 'Alex S.', NOW() - INTERVAL '2 days'),
    (contract_id_var, 'verification', 'ID Verified', 'System', NOW() - INTERVAL '3 days');
END $$;
