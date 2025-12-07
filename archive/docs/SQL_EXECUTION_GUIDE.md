# SQL Scripts Execution Guide
**Generated: November 11, 2025**

## ✅ Status
- **Backend APIs**: ✅ 100% Complete (all 4 endpoints implemented and running)
- **Frontend**: ✅ 100% Complete (all 4 pages updated)
- **SQL Execution**: ⏳ **PENDING** (3 scripts ready to execute)

## 📋 Scripts to Execute

### 1. **insert_department_mappings.sql** (Priority: HIGH)
- **Purpose**: Assign 70 users to departments with roles
- **Rows**: 70 user-department mappings
- **Table**: `user_department_access`
- **Impact**: Enables department filtering on Users page, populates department staff counts

### 2. **create_subdepartments.sql** (Priority: MEDIUM)
- **Purpose**: Create department hierarchy with 20 sub-departments
- **Rows**: 20 new departments
- **Table**: `department`
- **Impact**: Enables hierarchical department view, adds depth to org structure

### 3. **insert_branch_assignments.sql** (Priority: MEDIUM)
- **Purpose**: Assign 70 users to 6 branches
- **Rows**: 70 user-branch mappings
- **Table**: `user_branch_access`
- **Impact**: Enables branch filtering on Users page, populates branch stats

---

## 🔐 Azure Portal Method (RECOMMENDED)

### Step 1: Access Azure Portal
1. Navigate to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Azure credentials
3. Go to **All Resources** → **hospitalportal-db-server** (PostgreSQL)

### Step 2: Open Query Editor
1. In the PostgreSQL server blade, click **Query editor** (left sidebar)
2. Authenticate:
   - **Login**: `postgres`
   - **Password**: Your admin password
   - **Database**: `hospitalportal`
3. Click **OK** to connect

### Step 3: Execute Script 1 - Department Mappings
1. Open `insert_department_mappings.sql` in a text editor
2. **Copy entire file contents** (Ctrl+A, Ctrl+C)
3. Paste into Query Editor
4. Click **Run** button
5. **Expected Result**: 
   ```
   Query returned successfully in X ms.
   70 rows affected
   ```
6. **Verify**:
   ```sql
   SELECT COUNT(*) FROM user_department_access WHERE deleted_at IS NULL;
   -- Should return: 70
   ```

### Step 4: Execute Script 2 - Sub-Departments
1. Open `create_subdepartments.sql`
2. Copy entire contents
3. Paste into Query Editor
4. Click **Run**
5. **Expected Result**: 
   ```
   Query returned successfully in X ms.
   20 rows affected
   ```
6. **Verify**:
   ```sql
   SELECT COUNT(*) FROM department WHERE parent_department_id IS NOT NULL;
   -- Should return: 20
   
   SELECT department_name, parent_department_id 
   FROM department 
   WHERE parent_department_id IS NOT NULL 
   ORDER BY department_name;
   -- Should show 20 sub-departments
   ```

### Step 5: Execute Script 3 - Branch Assignments
1. Open `insert_branch_assignments.sql`
2. Copy entire contents
3. Paste into Query Editor
4. Click **Run**
5. **Expected Result**: 
   ```
   Query returned successfully in X ms.
   70 rows affected
   ```
6. **Verify**:
   ```sql
   SELECT COUNT(*) FROM user_branch_access WHERE deleted_at IS NULL;
   -- Should return: 70
   ```

---

## 🖥️ Alternative: Azure Cloud Shell

### Setup
```bash
# Open Azure Cloud Shell (bash)
# Install PostgreSQL client if not present
sudo apt-get update
sudo apt-get install -y postgresql-client

# Upload SQL files using Cloud Shell upload feature
# Or clone repository: git clone <your-repo-url>
```

### Execute Scripts
```bash
# Set connection details
export PGHOST=hospitalportal-db-server.postgres.database.azure.com
export PGUSER=postgres
export PGDATABASE=hospitalportal

# Execute each script
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f insert_department_mappings.sql
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f create_subdepartments.sql
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f insert_branch_assignments.sql

# Verify
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) FROM user_department_access WHERE deleted_at IS NULL;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) FROM user_branch_access WHERE deleted_at IS NULL;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) FROM department WHERE parent_department_id IS NOT NULL;"
```

---

## 🔧 Alternative: Fix Local Connection

### Add Firewall Rule
1. Azure Portal → PostgreSQL Server → **Networking** (Settings)
2. Click **+ Add firewall rule**
3. **Rule Name**: `LocalDev`
4. **Start IP**: `49.205.123.235`
5. **End IP**: `49.205.123.235`
6. Click **Save**

### Download SSL Certificate
```bash
# Download Azure PostgreSQL SSL cert
curl -o cert.pem https://dl.cacerts.digicert.com/DigiCertGlobalRootG2.crt.pem
```

### Execute with SSL
```bash
psql "host=hospitalportal-db-server.postgres.database.azure.com port=5432 dbname=hospitalportal user=postgres sslmode=require sslrootcert=cert.pem" -f insert_department_mappings.sql
psql "host=hospitalportal-db-server.postgres.database.azure.com port=5432 dbname=hospitalportal user=postgres sslmode=require sslrootcert=cert.pem" -f create_subdepartments.sql
psql "host=hospitalportal-db-server.postgres.database.azure.com port=5432 dbname=hospitalportal user=postgres sslmode=require sslrootcert=cert.pem" -f insert_branch_assignments.sql
```

---

## ✅ Post-Execution Verification

### Backend Verification
```bash
# Start backend if not running
cd "microservices/auth-service/AuthService"
dotnet run

# Test endpoints with curl or Postman
# GET http://localhost:5072/api/users/with-details
# GET http://localhost:5072/api/departments/with-staff-count
# GET http://localhost:5072/api/roles/with-user-count
# GET http://localhost:5072/api/admin/dashboard/stats
```

### Frontend Verification
```bash
# Start frontend
cd apps/hospital-portal-web
pnpm dev

# Navigate to:
# http://localhost:3000/dashboard/admin/users
# http://localhost:3000/dashboard/admin/departments
# http://localhost:3000/dashboard/admin/roles
# http://localhost:3000/dashboard
```

### Expected Results After SQL Execution

#### 1. Users Page (`/dashboard/admin/users`)
- **Before**: Users have no roles, departments, or branches
- **After**: 
  - All 70 users show role badges (e.g., "Ophthalmologist", "Optometrist")
  - Users show primary department (e.g., "Cataract Surgery", "Optical Shop")
  - Users show branch (e.g., "Sankara Nethralaya - Chennai Main")
  - Filters work: Select "Ophthalmologist" role → Shows 10 users
  - Department filter: Select "Optical Shop" → Shows 22 users

#### 2. Departments Page (`/dashboard/admin/departments`)
- **Before**: Staff counts are 0 or null
- **After**:
  - Department table shows real staff counts:
    - Cataract Surgery: 21 staff
    - Optical Shop: 22 staff
    - Eye Imaging Center: 8 staff
  - Total Staff stat card: 70
  - Hierarchy view shows 20 sub-departments:
    - Laboratory → 3 subs (Clinical Pathology, Microbiology, Biochemistry)
    - Eye Imaging Center → 5 subs (OCT, Fundus Photography, etc.)

#### 3. Roles Page (`/dashboard/admin/roles`)
- **Before**: User counts are 0 or null
- **After**:
  - Role badges show counts:
    - Ophthalmologist: 10 users
    - Optometrist: 8 users
    - Ophthalmic Nurse: 6 users
  - Click role badge → Expands to show user list with names and emails
  - Top 10 users per role visible

#### 4. Dashboard (`/dashboard`)
- **Before**: Hardcoded counts, no charts
- **After**:
  - Stats cards show real numbers:
    - Total Staff: 70
    - Departments: 33 (13 parent + 20 sub)
    - Roles: 50+
    - Branches: 6
  - Department chart: Top 5 departments with staff counts
  - Role chart: Top 5 roles with user counts
  - Branch chart: All 6 branches with staff distribution

---

## 🐛 Troubleshooting

### Issue 1: Authentication Failed
```
ERROR: password authentication failed for user "postgres"
```
**Solution**: 
1. Azure Portal → PostgreSQL → **Reset password** (left sidebar)
2. Generate new password
3. Update connection string/retry

### Issue 2: Connection Timeout
```
ERROR: could not connect to server: Connection timed out
```
**Solution**: Check firewall rules in Azure Portal → PostgreSQL → Networking

### Issue 3: Duplicate Key Errors
```
ERROR: duplicate key value violates unique constraint
```
**Solution**: Scripts may have already been executed. Verify with:
```sql
SELECT COUNT(*) FROM user_department_access;
SELECT COUNT(*) FROM user_branch_access;
SELECT COUNT(*) FROM department WHERE parent_department_id IS NOT NULL;
```

### Issue 4: Foreign Key Violations
```
ERROR: insert or update on table violates foreign key constraint
```
**Solution**: Ensure all prerequisite data exists (users, departments, branches, roles)

---

## 📊 Quick Status Check

Run this query to see current state:
```sql
SELECT 
  'Users' AS entity,
  COUNT(*) AS total
FROM aspnetusers
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'User-Department Mappings' AS entity,
  COUNT(*) AS total
FROM user_department_access
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'User-Branch Mappings' AS entity,
  COUNT(*) AS total
FROM user_branch_access
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  'Parent Departments' AS entity,
  COUNT(*) AS total
FROM department
WHERE parent_department_id IS NULL AND deleted_at IS NULL

UNION ALL

SELECT 
  'Sub-Departments' AS entity,
  COUNT(*) AS total
FROM department
WHERE parent_department_id IS NOT NULL AND deleted_at IS NULL;
```

**Expected Results After Execution**:
| Entity | Total |
|--------|-------|
| Users | 70 |
| User-Department Mappings | 70 |
| User-Branch Mappings | 70 |
| Parent Departments | 13 |
| Sub-Departments | 20 |

---

## 🚀 Next Steps After SQL Execution

1. ✅ **Verify Data**: Run status check query above
2. ✅ **Test Backend**: Call all 4 APIs with Postman/Swagger
3. ✅ **Test Frontend**: Navigate to all 4 pages and verify data displays
4. ✅ **Test Filters**: Try role, department, branch filters on Users page
5. ✅ **Test Expansion**: Click role user counts to expand user lists
6. ✅ **Test Charts**: Verify dashboard charts render correctly

---

## 📝 Notes

- All scripts use `BEGIN...COMMIT` transactions for safety
- Scripts set `app.current_tenant_id` for RLS compliance
- UUIDs are pre-generated for consistency
- All timestamps use `NOW()` for current time
- Soft deletes: Records have `deleted_at IS NULL`

**Total Time Estimate**: 10-15 minutes for all 3 scripts
