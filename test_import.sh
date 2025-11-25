#!/bin/bash
export DATABASE_URL="postgres://nppe:StrongP@ss_123@localhost:5432/nppe?sslmode=disable"
cd /root/Learning-platform/source
./back/import_qbank --create-missing-topics ./questions/nppe_r1.qbank.md
