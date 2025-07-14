ALTER TABLE user_transaction_summary
-- Behavioral Variables
ADD COLUMN high_value_trans_count_90d INT DEFAULT 0,
ADD COLUMN crypto_trans_ratio_30d NUMERIC(5,2) DEFAULT 0,
-- Temporal Behavior Variables
ADD COLUMN night_trans_ratio_30d NUMERIC(5,2) DEFAULT 0,
ADD COLUMN weekday_trans_ratio NUMERIC(5,2) DEFAULT 0,
ADD COLUMN avg_gap_between_trans NUMERIC(10,2) DEFAULT 0,
ADD COLUMN days_since_last_trans INT DEFAULT 0,
ADD COLUMN burst_trans_count_24h INT DEFAULT 0,
-- Risk & AML Specific Variables
ADD COLUMN kyc_age_days INT DEFAULT 0,
ADD COLUMN large_trans_change_ratio NUMERIC(5,2) DEFAULT 0,
ADD COLUMN geo_diversity_score NUMERIC(5,2) DEFAULT 0,
ADD COLUMN flagged_trans_ratio_30d NUMERIC(5,2) DEFAULT 0,
ADD COLUMN trans_below_threshold_7d INT DEFAULT 0;
