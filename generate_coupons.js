const fs = require('fs');
const crypto = require('crypto');

// Configuration
const QUANTITY = 100; // How many coupons to generate
const PREFIX = 'CERTFLO'; // Prefix for your brand
const CODE_LENGTH = 8; // Length of the random part

// Function to generate a secure random string
function generateCode(prefix, length) {
  const randomPart = crypto.randomBytes(length)
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
  return `${prefix}-${randomPart}`;
}

// Function to generate UUID (simple version for this script)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Main generation logic
const coupons = new Set(); // Use a Set to ensure uniqueness

while (coupons.size < QUANTITY) {
  coupons.add(generateCode(PREFIX, CODE_LENGTH));
}

// Generate SQL for the existing coupon table structure
let sqlContent = `INSERT INTO coupons (id, code, description, discount_type, discount_value, max_uses, valid_from, valid_until, is_active, created_by, created_at, updated_at)\nVALUES\n`;

const adminUUID = '00000000-0000-0000-0000-000000000000'; // Replace with actual admin UUID
const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format for SQL
const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

const values = Array.from(coupons).map(code => {
  const id = generateUUID();
  return `  ('${id}', '${code}', 'Test access coupon - grants full access to practice tests', 'percentage', 100.0, 1, '${now}', '${oneYearFromNow}', true, '${adminUUID}', '${now}', '${now}')`;
}).join(',\n');

sqlContent += values + ';';

// Also generate SQL for coupon usage table if needed (empty initially)
sqlContent += '\n\n-- Coupon usage table starts empty\n';

// Option 2: Save to CSV
const csvContent = Array.from(coupons).join('\n');

// Write files
fs.writeFileSync('coupons_insert.sql', sqlContent);
fs.writeFileSync('coupons_list.csv', csvContent);

console.log(`✅ Successfully generated ${QUANTITY} unique coupons.`);
console.log(`📂 SQL file created: coupons_insert.sql`);
console.log(`📂 CSV file created: coupons_list.csv`);
console.log(`📋 Each coupon grants 100% discount (full test access) and can be used once`);

// Preview first 5
console.log('\n--- Preview ---');
Array.from(coupons).slice(0, 5).forEach(c => console.log(c));
