-- user_transaction_summary table
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated := CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_last_updated
BEFORE UPDATE ON user_transaction_summary
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();


-- behavioral_variables table
CREATE OR REPLACE FUNCTION update_behavioral_variables_definitions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at := CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_behavioral_variables_definitions_updated_at
BEFORE UPDATE ON behavioral_variables_definitions
FOR EACH ROW
EXECUTE FUNCTION update_behavioral_variables_definitions_updated_at();

-- rules table
CREATE OR REPLACE FUNCTION update_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at := CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rules_updated_at
BEFORE UPDATE ON rules
FOR EACH ROW
EXECUTE FUNCTION update_rules_updated_at();
