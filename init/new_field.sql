ALTER TABLE user_transaction_summary
-- Behavioral Variables
ADD COLUMN high_value_txn_count_90 INT DEFAULT 0,
ADD COLUMN crypto_txn_ratio_30 NUMERIC(5,2) DEFAULT 0,
-- Temporal Behavior Variables
ADD COLUMN night_txn_ratio_30 NUMERIC(5,2) DEFAULT 0,
ADD COLUMN weekday_txn_ratio NUMERIC(5,2) DEFAULT 0,
ADD COLUMN avg_gap_between_txn NUMERIC(10,2) DEFAULT 0,
ADD COLUMN days_since_last_txn INT DEFAULT 0,
ADD COLUMN burst_txn_count_24h INT DEFAULT 0,
-- Risk & AML Specific Variables
ADD COLUMN kyc_age_days INT DEFAULT 0,
ADD COLUMN large_txn_change_ratio NUMERIC(5,2) DEFAULT 0,
ADD COLUMN geo_diversity_score NUMERIC(5,2) DEFAULT 0,
ADD COLUMN flagged_txn_ratio_30 NUMERIC(5,2) DEFAULT 0,
ADD COLUMN txn_below_threshold_7 INT DEFAULT 0;
