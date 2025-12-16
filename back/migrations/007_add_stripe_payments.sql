-- Migration: Add Stripe payments table for webhook processing
-- Adds table to track Stripe payment events and prevent duplicate credit grants

CREATE TABLE IF NOT EXISTS stripe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkout_session_id VARCHAR(255) UNIQUE NOT NULL,
    payment_intent_id VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    source VARCHAR(20) DEFAULT 'stripe',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance and uniqueness
CREATE INDEX idx_stripe_payments_user_id ON stripe_payments(user_id);
CREATE INDEX idx_stripe_payments_checkout_session_id ON stripe_payments(checkout_session_id);
CREATE INDEX idx_stripe_payments_payment_intent_id ON stripe_payments(payment_intent_id);
CREATE INDEX idx_stripe_payments_status ON stripe_payments(status);
CREATE INDEX idx_stripe_payments_source ON stripe_payments(source);

-- Soft delete index
CREATE INDEX idx_stripe_payments_deleted_at ON stripe_payments(deleted_at);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_stripe_payments_updated_at 
    BEFORE UPDATE ON stripe_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
