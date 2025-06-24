-- Improve join performance with user_transaction_summary
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_id ON transactions(receiver_id);

-- Speed up filtering or reviewing flagged transactions
CREATE INDEX IF NOT EXISTS idx_transactions_flag ON transactions(flag);

-- Enable faster tracking of transactions by the rule that flagged them
CREATE INDEX IF NOT EXISTS idx_flagged_by_rule ON transactions(flagged_by_rule);

-- Optimize time-based queries and batch processing
CREATE INDEX IF NOT EXISTS idx_transaction_time ON transactions(transaction_time);

-- Index on transactions.id (usually already a PRIMARY KEY, but ensure it exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_id ON transactions(id);

-- Index on user_transaction_summary.user_id (used in JOIN with transactions)
CREATE INDEX IF NOT EXISTS idx_user_transaction_summary_user_id ON user_transaction_summary(user_id);
