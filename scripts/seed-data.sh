#!/bin/bash
# ---------------------------------------------------------------------------
# Seeds sample data into every local service database.
#
# Idempotent: each statement is guarded, so re-running does not duplicate rows
# or violate unique constraints. Safe to run against a fresh volume.
#
#   ./scripts/seed-data.sh
# ---------------------------------------------------------------------------
set -euo pipefail

CONTAINER="${POSTGRES_CONTAINER:-makabasla-postgres}"

# Fall back to the values in .env when they are not exported in the environment.
if [ -z "${POSTGRES_USER:-}" ] && [ -f .env ]; then
  POSTGRES_USER="$(sed -n 's/^POSTGRES_USER=//p' .env | head -1)"
fi
PGUSER="${POSTGRES_USER:-postgres}"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Postgres container '$CONTAINER' is not running." >&2
  echo "Start it with: docker compose up -d postgres" >&2
  exit 1
fi

psql_db() {
  local db="$1"
  shift
  docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 -U "$PGUSER" -d "$db" "$@"
}

echo "Seeding iamdb..."
psql_db iamdb <<'SQL'
-- NOTE: passwords are stored and compared in PLAINTEXT by the IAM service
-- (bcrypt is imported but commented out in internal/service/iam_service.go).
-- These are local development credentials only. See docs/SETUP_GUIDE.md.
INSERT INTO admins (id, username, password, email, name, phone, image_url, created_at, updated_at) VALUES
  ('ad-0000-0000-0000-000000000001', 'admin',   'admin123',   'admin@makabasla.test',   'Ashan Perera',  '+94771234567', 'https://i.pravatar.cc/150?img=12', NOW(), NOW()),
  ('ad-0000-0000-0000-000000000002', 'manager', 'manager123', 'manager@makabasla.test', 'Nadeesha Silva','+94771234568', 'https://i.pravatar.cc/150?img=32', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Keep the password in sync on re-runs so the documented credentials always work.
UPDATE admins SET password = 'admin123'   WHERE id = 'ad-0000-0000-0000-000000000001';
UPDATE admins SET password = 'manager123' WHERE id = 'ad-0000-0000-0000-000000000002';

INSERT INTO customers (id, email, password, name, phone, image_url, created_at, updated_at) VALUES
  ('cu-0000-0000-0000-000000000001', 'kasun@example.test',  'customer123', 'Kasun Jayawardena', '+94712223344', 'https://i.pravatar.cc/150?img=5',  NOW(), NOW()),
  ('cu-0000-0000-0000-000000000002', 'dilani@example.test', 'customer123', 'Dilani Fernando',   '+94712223345', 'https://i.pravatar.cc/150?img=9',  NOW(), NOW()),
  ('cu-0000-0000-0000-000000000003', 'ruwan@example.test',  'customer123', 'Ruwan Bandara',     '+94712223346', 'https://i.pravatar.cc/150?img=15', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

UPDATE customers SET password = 'customer123' WHERE id IN (
  'cu-0000-0000-0000-000000000001',
  'cu-0000-0000-0000-000000000002',
  'cu-0000-0000-0000-000000000003'
);

INSERT INTO staffs (id, email, name, phone, image_url, role, created_at, updated_at) VALUES
  ('st-0000-0000-0000-000000000001', 'frontdesk@makabasla.test', 'Ishara Weerasinghe', '+94713334455', 'https://i.pravatar.cc/150?img=20', 'front-desk', NOW(), NOW()),
  ('st-0000-0000-0000-000000000002', 'accounts@makabasla.test',  'Malith Gunawardena', '+94713334456', 'https://i.pravatar.cc/150?img=25', 'accountant', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO technicians (id, email, name, phone, image_url, specialization, created_at, updated_at) VALUES
  ('te-0000-0000-0000-000000000001', 'sunil@makabasla.test',  'Sunil Rathnayake', '+94714445566', 'https://i.pravatar.cc/150?img=51', 'Engine & Transmission', NOW(), NOW()),
  ('te-0000-0000-0000-000000000002', 'priya@makabasla.test',  'Priya Mendis',     '+94714445567', 'https://i.pravatar.cc/150?img=45', 'Electrical Systems',    NOW(), NOW()),
  ('te-0000-0000-0000-000000000003', 'kamal@makabasla.test',  'Kamal Dissanayake','+94714445568', 'https://i.pravatar.cc/150?img=60', 'Bodywork & Paint',      NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Vehicles reference customers, so they must exist first. IDs are serial.
INSERT INTO vehicles (id, make, model, year, color, plate_number, image_url, customer_id, created_at, updated_at) VALUES
  (1, 'Toyota',     'Corolla Axio', 2018, 'Silver',  'WP-CAB-1234', '', 'cu-0000-0000-0000-000000000001', NOW(), NOW()),
  (2, 'Honda',      'Vezel',        2020, 'Blue',    'WP-CAD-5678', '', 'cu-0000-0000-0000-000000000001', NOW(), NOW()),
  (3, 'Suzuki',     'Wagon R',      2016, 'White',   'CP-CAE-9012', '', 'cu-0000-0000-0000-000000000002', NOW(), NOW()),
  (4, 'Nissan',     'Leaf',         2021, 'Black',   'WP-CAF-3456', '', 'cu-0000-0000-0000-000000000003', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('vehicles', 'id'), GREATEST((SELECT MAX(id) FROM vehicles), 1));
SQL

echo "Seeding billingdb..."
psql_db billingdb <<'SQL'
INSERT INTO billings (id, vehicle_id, total_expenses, total_advances, balance_due, created_at, updated_at) VALUES
  ('bl-0000-0000-0000-000000000001', 1, 47500.00, 20000.00, 27500.00, NOW(), NOW()),
  ('bl-0000-0000-0000-000000000002', 2, 18250.50, 10000.00,  8250.50, NOW(), NOW()),
  ('bl-0000-0000-0000-000000000003', 3, 9000.00,   9000.00,     0.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO expenses (id, billing_id, date, description, amount, created_at, updated_at) VALUES
  ('ex-0000-0000-0000-000000000001', 'bl-0000-0000-0000-000000000001', '2026-10-01', 'Engine tune-up and oil change',      12500.00, NOW(), NOW()),
  ('ex-0000-0000-0000-000000000002', 'bl-0000-0000-0000-000000000001', '2026-10-03', 'Brake pad replacement (front pair)',  18000.00, NOW(), NOW()),
  ('ex-0000-0000-0000-000000000003', 'bl-0000-0000-0000-000000000001', '2026-10-08', 'Battery replacement',                 17000.00, NOW(), NOW()),
  ('ex-0000-0000-0000-000000000004', 'bl-0000-0000-0000-000000000002', '2026-10-02', 'Hybrid system diagnostic',             4500.00, NOW(), NOW()),
  ('ex-0000-0000-0000-000000000005', 'bl-0000-0000-0000-000000000002', '2026-10-06', 'Air conditioning regas',               6250.50, NOW(), NOW()),
  ('ex-0000-0000-0000-000000000006', 'bl-0000-0000-0000-000000000002', '2026-10-09', 'Wheel alignment and balancing',        7500.00, NOW(), NOW()),
  ('ex-0000-0000-0000-000000000007', 'bl-0000-0000-0000-000000000003', '2026-10-04', 'Full service and filter change',       9000.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO advances (id, billing_id, date, description, amount, created_at, updated_at) VALUES
  ('av-0000-0000-0000-000000000001', 'bl-0000-0000-0000-000000000001', '2026-10-01', 'Cash advance at drop-off', 20000.00, NOW(), NOW()),
  ('av-0000-0000-0000-000000000002', 'bl-0000-0000-0000-000000000002', '2026-10-02', 'Card payment on account',  10000.00, NOW(), NOW()),
  ('av-0000-0000-0000-000000000003', 'bl-0000-0000-0000-000000000003', '2026-10-04', 'Full settlement upfront',   9000.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
SQL

echo "Seeding appointmentdb..."
psql_db appointmentdb <<'SQL'
-- customer_id / technician_id reference iamdb identifiers, which are strings
-- (customers.id = 'cu-0000-...', technicians.id = 'te-0000-...').
-- vehicle_id is a bigint matching iamdb.vehicles.id.
INSERT INTO appointments (id, vehicle_id, customer_id, technician_id, title, notes, status, scheduled_at, created_at, updated_at) VALUES
  (1, 1, 'cu-0000-0000-0000-000000000001', 'te-0000-0000-0000-000000000001', 'Engine diagnostic',   'Customer reports knocking sound at idle.',   'scheduled',   '2026-10-27 09:00', NOW(), NOW()),
  (2, 2, 'cu-0000-0000-0000-000000000001', 'te-0000-0000-0000-000000000002', 'Hybrid battery check','Range down to 60% of original.',             'confirmed',   '2026-10-27 11:30', NOW(), NOW()),
  (3, 3, 'cu-0000-0000-0000-000000000002', 'te-0000-0000-0000-000000000001', 'Routine service',     'Standard 10,000 km service.',                'in_progress', '2026-10-25 08:30', NOW(), NOW()),
  (4, 4, 'cu-0000-0000-0000-000000000003', 'te-0000-0000-0000-000000000003', 'Rear bumper repaint', 'Scratch on rear-left corner.',               'completed',   '2026-10-20 14:00', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('appointments', 'id'), GREATEST((SELECT MAX(id) FROM appointments), 1));
SQL

echo "Seeding taskdb..."
psql_db taskdb <<'SQL'
INSERT INTO tasks (id, vehicle_id, task_number, description, status, created_at, updated_at) VALUES
  (1, 1, 'TSK-1001', 'Drain and replace engine oil, replace oil filter.', 'done',        NOW(), NOW()),
  (2, 1, 'TSK-1002', 'Inspect and replace front brake pads.',             'done',        NOW(), NOW()),
  (3, 2, 'TSK-1003', 'Run hybrid battery health diagnostic.',             'working on',  NOW(), NOW()),
  (4, 3, 'TSK-1004', 'Replace air filter and spark plugs.',               'pending',     NOW(), NOW()),
  (5, 4, 'TSK-1005', 'Sand, prime and repaint rear bumper.',              'start',       NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('tasks', 'id'), GREATEST((SELECT MAX(id) FROM tasks), 1));
SQL

echo "Seeding webstoredb..."
psql_db webstoredb <<'SQL'
INSERT INTO products (id, name, description, category, price, stock, image_url) VALUES
  (1, 'Engine Oil 5W-30 (4L)',   'Fully synthetic engine oil, 4 litre pack.',        'Fluids',     8900.00, 40, ''),
  (2, 'Brake Pad Set (Front)',   'Ceramic front brake pads, most sedans.',           'Brakes',    14500.00, 25, ''),
  (3, 'Air Filter',              'Standard panel air filter.',                       'Filters',    2800.00, 60, ''),
  (4, 'Car Battery 55Ah',        'Maintenance-free lead acid battery.',              'Electrical',23500.00, 12, ''),
  (5, 'Wiper Blade Pair',        'All-weather silicone wiper blades.',               'Exterior',   3200.00, 35, ''),
  (6, 'Car Care Detailing Kit',  'Shampoo, wax and microfibre cloths.',              'Care',       6500.00, 18, '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, product_id, quantity, total, created_at) VALUES
  (1, 1, 2, 17800.00, NOW() - INTERVAL '6 days'),
  (2, 3, 1,  2800.00, NOW() - INTERVAL '5 days'),
  (3, 2, 1, 14500.00, NOW() - INTERVAL '3 days'),
  (4, 5, 3,  9600.00, NOW() - INTERVAL '2 days'),
  (5, 4, 1, 23500.00, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('products', 'id'), GREATEST((SELECT MAX(id) FROM products), 1));
SELECT setval(pg_get_serial_sequence('orders', 'id'),   GREATEST((SELECT MAX(id) FROM orders), 1));
SQL

echo
echo "Seed complete. Row counts:"
for db in iamdb billingdb appointmentdb taskdb webstoredb; do
  echo "--- $db ---"
  psql_db "$db" -tAc "SELECT relname || ': ' || n_live_tup FROM pg_stat_user_tables ORDER BY relname;" 2>/dev/null || true
done
