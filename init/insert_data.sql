-- Insert users
INSERT INTO users (name, balance) VALUES
( 'Alice Johnson',8000),
( 'Bob Smith', 5000),
( 'Charlie Davis', 3000),
( 'Diana White', 7000);


-- Insert transactions
INSERT INTO transactions (
    age, trans_amt, new_trans, sex, nationality, type,
    occupation, balance, origination, cross_border,
    risk_score, pep_status
) VALUES
(30, 500, TRUE, 'Female', 'USA', 'Transfer', 'Engineer', 1000, 'Online', FALSE, 12.5, FALSE),
(45, 2000, TRUE, 'Male', 'UK', 'Withdrawal', 'Teacher', 2500, 'ATM', FALSE, 30.0, FALSE ),
(27, 150, FALSE, 'Other', 'Canada', 'Payment', 'Freelancer', 800, 'Mobile', FALSE, 5.0, FALSE ),
(35, 7500, TRUE, 'Male', 'Nigeria', 'Transfer', 'Business Owner', 9000, 'SWIFT', TRUE, 70.0, TRUE),
(29, 320, TRUE, 'Female', 'Germany', 'Crypto Purchase', 'Developer', 1500, 'Crypto Wallet', TRUE, 40.5, FALSE);


INSERT INTO rules (name, description, condition, flag_level, risk_increment)
VALUES
(
  'High ATM Withdrawal by Young User',
  'ATM withdrawal over 5L by users below 25',
  'trans_amt > 500000 AND origination = ''ATM'' AND age < 25',
  'High',
  25.0
),
(
  'Cross-Border High Amount',
  'Cross-border transfer over 10L',
  'cross_border = TRUE AND trans_amt > 1000000',
  'High',
  30.0
),
(
  'PEP High Risk Transaction',
  'Any transaction by PEP above 1L',
  'pep_status = TRUE AND trans_amt > 100000',
  'Medium',
  20.0
),
(
  'Crypto Origination Moderate Amount',
  'Crypto wallet transaction above 3L',
  'origination = ''Crypto Wallet'' AND trans_amt > 300000',
  'Medium',
  15.0
);


