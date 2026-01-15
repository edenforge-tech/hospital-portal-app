# Unified Permissions Management - UI/UX Design

## Design Philosophy

**ONE PAGE, FOUR PERSPECTIVES** - Let administrators manage permissions from whichever angle makes sense for their task.

## Main Layout - Tabbed Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERMISSIONS MANAGEMENT                                     [Save All] [Reset]│
├─────────────────────────────────────────────────────────────────────────────┤
│  [1. Role Permissions] [2. User Access] [3. Department Access] [4. Bulk Ops]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  (Tab content here)                                                          │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## TAB 1: Role Permissions (RBAC)
**Use Case**: "Assign module permissions to roles"

### Layout:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Role Permissions - Define what each role can do                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Quick Filters:                                                                │
│ Module: [All Modules ▼]  Role: [All Roles ▼]  [Search permissions...]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                    │ ADMIN  │ DOCTOR │ NURSE  │ RECEP. │ PHARMA │ Add Role...│
│ PERMISSION         │(12)    │(8)     │(5)     │(3)     │(4)     │            │
├────────────────────┼────────┼────────┼────────┼────────┼────────┼───────────┤
│ 📋 ADMINISTRATION                                                            │
│   View Users       │   ✓    │   -    │   -    │   -    │   -    │            │
│   Create Users     │   ✓    │   -    │   -    │   -    │   -    │            │
│   Edit Users       │   ✓    │   -    │   -    │   -    │   -    │            │
│   Delete Users     │   ✓    │   -    │   -    │   -    │   -    │            │
│                                                                               │
│ 📅 APPOINTMENTS                                                              │
│   View Schedule    │   ✓    │   ✓    │   ✓    │   ✓    │   -    │            │
│   Create Appt.     │   ✓    │   ✓    │   ✓    │   ✓    │   -    │            │
│   Cancel Appt.     │   ✓    │   ✓    │   -    │   ✓    │   -    │            │
│                                                                               │
│ 🏥 PATIENT MANAGEMENT                                                        │
│   View Records     │   ✓    │   ✓    │   ✓    │   -    │   -    │            │
│   Create Records   │   ✓    │   ✓    │   -    │   -    │   -    │            │
│   Edit Records     │   ✓    │   ✓    │   -    │   -    │   -    │            │
│                                                                               │
│ 💊 PHARMACY                                                                   │
│   View Meds        │   ✓    │   ✓    │   -    │   -    │   ✓    │            │
│   Dispense Meds    │   ✓    │   -    │   -    │   -    │   ✓    │            │
│   Manage Stock     │   ✓    │   -    │   -    │   -    │   ✓    │            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Bulk Actions:                                                                 │
│ [Select Role: Doctor ▼]  [Copy Permissions To: Consultant ▼]  [Copy]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Checkbox toggles for quick permission assignment
- ✅ Column headers show role names with user counts
- ✅ Grouped by module (collapsible sections)
- ✅ Copy permissions between roles
- ✅ Highlight column on hover for better visibility

---

## TAB 2: User Access (Combined RBAC + ABAC)
**Use Case**: "Manage individual user's complete access"

### Layout:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ User Access - Manage individual user permissions and department access       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Select User:                                                                  │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ [Search user by name, email, or ID...]                              [⌄] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ Selected: Dr. Sarah Johnson (sarah.johnson@hospital.com)                    │
│ Primary Department: Cardiology  |  Employee ID: EMP-2024-456                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌─── ROLE & BASE PERMISSIONS ─────────────────────────────────────────────┐ │
│ │                                                                           │ │
│ │ Assigned Role: [Doctor ▼]                  [View Role Permissions →]     │ │
│ │                                                                           │ │
│ │ Inherited Permissions (from Doctor role):                                │ │
│ │   ✓ View patient records     ✓ Create diagnoses                         │ │
│ │   ✓ Order lab tests          ✓ Prescribe medications                    │ │
│ │   ✓ View appointments        ✓ Create appointments                      │ │
│ │                                                                           │ │
│ │ Additional Permissions (User-specific overrides):                        │ │
│ │   [+ Add Permission]                                                     │ │
│ │   ✓ Manage department staff (override)  [Remove]                        │ │
│ │   ✓ Approve leave requests (override)   [Remove]                        │ │
│ │                                                                           │ │
│ │ Revoked Permissions (Remove from role permissions):                      │ │
│ │   [+ Revoke Permission]                                                  │ │
│ │   ✗ Delete patient records (revoked)    [Restore]                       │ │
│ │                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─── DEPARTMENT ACCESS (WHERE user can access data) ──────────────────────┐ │
│ │                                                                           │ │
│ │ Access Level:                                                            │ │
│ │   ○ Own Department Only (Cardiology)                                     │ │
│ │   ● Multiple Departments (custom selection)                              │ │
│ │   ○ All Departments (hospital-wide access)                               │ │
│ │                                                                           │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Main Departments:                    Sub-Departments:                │ │ │
│ │ │ ┌──────────────────────┐            ┌────────────────────────────┐ │ │ │
│ │ │ │ ✓ Cardiology ★       │ ────────▶  │ ✓ Interventional Cardio.  │ │ │ │
│ │ │ │ ✓ Emergency Medicine │            │ ✓ Pediatric Cardiology    │ │ │ │
│ │ │ │ □ General Surgery    │            │ ✓ Electrophysiology       │ │ │ │
│ │ │ │ □ Internal Medicine  │            │ □ Cardiac Rehabilitation  │ │ │ │
│ │ │ │ □ Neurology          │            └────────────────────────────┘ │ │ │
│ │ │ │ □ Obstetrics & Gyn.  │                                          │ │ │
│ │ │ │ □ Oncology           │            Emergency Medicine:           │ │ │
│ │ │ │ □ Orthopedics        │            ┌────────────────────────────┐ │ │ │
│ │ │ │ □ Pediatrics         │            │ ✓ Trauma Unit             │ │ │ │
│ │ │ │ □ Psychiatry         │            │ ✓ Critical Care           │ │ │ │
│ │ │ │ □ Pulmonology        │            │ ✓ Emergency Surgery       │ │ │ │
│ │ │ │ ...                  │            └────────────────────────────┘ │ │ │
│ │ │ └──────────────────────┘                                          │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                           │ │
│ │ ★ = Primary Department                                                   │ │
│ │                                                                           │ │
│ │ Quick Actions:                                                            │ │
│ │ [Select All in Cardiology] [Clear All] [Copy from Another User...]       │ │
│ │                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─── EFFECTIVE ACCESS SUMMARY ─────────────────────────────────────────────┐ │
│ │                                                                           │ │
│ │ Dr. Sarah Johnson can:                                                   │ │
│ │   • View, create, and edit patient records                               │ │
│ │   • Create diagnoses and prescribe medications                           │ │
│ │   • Order lab tests and view results                                     │ │
│ │   • Manage department staff (special permission)                         │ │
│ │   • Approve leave requests (special permission)                          │ │
│ │                                                                           │ │
│ │ For patients in these departments:                                       │ │
│ │   • Cardiology (all sub-departments)                                     │ │
│ │   • Emergency Medicine (all sub-departments)                             │ │
│ │                                                                           │ │
│ │ Total: 2 main departments, 8 sub-departments                             │ │
│ │                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│                                         [Save User Access]  [Cancel]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Single-user comprehensive view
- ✅ Shows inherited permissions from role
- ✅ Add user-specific permission overrides
- ✅ Revoke specific permissions (blacklist)
- ✅ Visual department tree with primary indicator
- ✅ Sub-departments auto-shown when parent selected
- ✅ Effective access summary in plain English

---

## TAB 3: Department Access Matrix
**Use Case**: "See which users have access to which departments"

### Layout:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Department Access - Manage department access for multiple users              │
├─────────────────────────────────────────────────────────────────────────────┤
│ View Mode: ● By Department  ○ By User                                        │
│ Filter: Department: [Cardiology ▼]  Role: [All Roles ▼]  [Search users...]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ DEPARTMENT: CARDIOLOGY (15 users with access)                                │
│                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                                        │ Main  │ Interv.│ Pedia. │ Electro│ │
│ │ USER                    ROLE           │ Dept. │ Cardio │ Cardio │ physio │ │
│ ├────────────────────────────────────────┼───────┼────────┼────────┼────────┤ │
│ │ Dr. Sarah Johnson      Doctor          │  ★ ✓  │   ✓    │   ✓    │   ✓   │ │
│ │ Dr. Michael Chen       Doctor          │  ★ ✓  │   ✓    │   -    │   -   │ │
│ │ Dr. Emily Rodriguez    Consultant      │  ★ ✓  │   ✓    │   ✓    │   ✓   │ │
│ │ Nurse Patricia Wilson  Nurse           │  ★ ✓  │   ✓    │   -    │   -   │ │
│ │ Nurse James Martinez   Nurse           │    ✓  │   -    │   ✓    │   -   │ │
│ │ Tech. Robert Kim       Lab Tech        │    ✓  │   ✓    │   ✓    │   ✓   │ │
│ │ Admin Karen Foster     Admin           │    ✓  │   ✓    │   ✓    │   ✓   │ │
│ │ ...                                    │       │        │        │       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ★ = Primary Department                                                       │
│                                                                               │
│ Bulk Actions:                                                                 │
│ ☑ Select All Users  [Add Selected to: Emergency Medicine ▼]  [Add Access]    │
│ [Remove All Access from Cardiology]  [Export to Excel]                       │
│                                                                               │
│ Quick Add:                                                                    │
│ [Select User ▼] [Add to This Department]                                     │
└─────────────────────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────────────

VIEW MODE: BY USER (Alternative view)

┌─────────────────────────────────────────────────────────────────────────────┐
│ USER: Dr. Sarah Johnson                                                       │
│                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ DEPARTMENT                     │ Main │ Sub-Departments           │Access│ │
│ ├────────────────────────────────┼──────┼───────────────────────────┼──────┤ │
│ │ Cardiology ★                   │  ✓   │ ✓✓✓ (3 of 4)              │ Edit │ │
│ │ Emergency Medicine             │  ✓   │ ✓✓✓ (3 of 5)              │ Edit │ │
│ │ General Surgery                │  -   │ - (0 of 6)                │ Add  │ │
│ │ Internal Medicine              │  -   │ - (0 of 8)                │ Add  │ │
│ │ ...                            │      │                           │      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ [+ Add Department Access]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Two-way view: By Department or By User
- ✅ Matrix shows all sub-department access
- ✅ Primary department indicator
- ✅ Bulk select and modify
- ✅ Quick add users to departments
- ✅ Export functionality

---

## TAB 4: Bulk Operations
**Use Case**: "Manage many users or departments at once"

### Layout:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Bulk Operations - Manage multiple users and departments simultaneously       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│ ┌─── OPERATION 1: BULK PERMISSION ASSIGNMENT ──────────────────────────────┐ │
│ │                                                                           │ │
│ │ Step 1: Select Users                                                      │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Filter: Department: [Cardiology ▼]  Role: [Doctor ▼]               │ │ │
│ │ │                                                                       │ │ │
│ │ │ ☑ Dr. Sarah Johnson        ☑ Dr. Michael Chen                       │ │ │
│ │ │ ☑ Dr. Emily Rodriguez      ☐ Dr. James Wilson                       │ │ │
│ │ │ ☑ Dr. Lisa Anderson        ☐ Dr. Robert Lee                         │ │ │
│ │ │                                                                       │ │ │
│ │ │ 3 of 6 users selected  [Select All] [Clear Selection]               │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                           │ │
│ │ Step 2: Select Action                                                     │ │
│ │ ● Add Permissions   ○ Remove Permissions   ○ Replace Role                │ │
│ │                                                                           │ │
│ │ Step 3: Choose Permissions/Role                                           │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ☑ Manage department staff                                            │ │ │
│ │ │ ☑ Approve leave requests                                             │ │ │
│ │ │ ☐ Access confidential records                                        │ │ │
│ │ │ ...                                                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                           │ │
│ │                                           [Apply to 3 Selected Users]     │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─── OPERATION 2: BULK DEPARTMENT ACCESS ──────────────────────────────────┐ │
│ │                                                                           │ │
│ │ Scenario: [Grant department access ▼]                                    │ │
│ │                                                                           │ │
│ │ Selected Users (from above): 3 users                                     │ │
│ │ OR [Select Different Users...]                                           │ │
│ │                                                                           │ │
│ │ Departments to Add:                                                       │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ☑ Emergency Medicine (include all 5 sub-departments)                 │ │ │
│ │ │ ☑ General Surgery (include all 6 sub-departments)                    │ │ │
│ │ │ ☐ Internal Medicine                                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                           │ │
│ │ This will grant access to 2 departments (11 sub-departments) for 3 users│ │
│ │                                                                           │ │
│ │                                           [Grant Department Access]       │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─── OPERATION 3: COPY ACCESS FROM USER TO USER(S) ───────────────────────┐ │
│ │                                                                           │ │
│ │ Copy From: [Dr. Sarah Johnson ▼]                                         │ │
│ │                                                                           │ │
│ │ Copy To: (Select multiple)                                                │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ ☑ Dr. New Doctor 1                                                   │ │ │
│ │ │ ☑ Dr. New Doctor 2                                                   │ │ │
│ │ │ ☑ Dr. New Doctor 3                                                   │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                           │ │
│ │ What to Copy:                                                             │ │
│ │ ☑ Role assignment                                                         │ │
│ │ ☑ Additional permissions                                                  │ │
│ │ ☑ Department access (including sub-departments)                           │ │
│ │ ☐ Primary department designation                                          │ │
│ │                                                                           │ │
│ │                                            [Copy to 3 Selected Users]     │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│ ┌─── OPERATION 4: BATCH IMPORT/EXPORT ─────────────────────────────────────┐ │
│ │                                                                           │ │
│ │ Import Users with Access:                                                 │ │
│ │ [Upload CSV/Excel]  [Download Template]                                  │ │
│ │                                                                           │ │
│ │ Export Current Configuration:                                             │ │
│ │ [Export All Users]  [Export Selected Users]  [Export by Department]      │ │
│ │                                                                           │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Multi-step wizard for bulk operations
- ✅ Add/remove permissions for multiple users
- ✅ Grant department access to multiple users
- ✅ Copy complete access profile from one user to others
- ✅ Import/export functionality
- ✅ Preview before applying

---

## Interaction Patterns

### 1. **Inline Editing**
- Click any checkbox to instantly toggle
- Shows loading spinner during save
- Green flash on success, red on error

### 2. **Smart Suggestions**
```
When adding department access:
"Users in the Cardiology role typically also have access to Emergency Medicine. 
Add Emergency Medicine? [Yes] [No]"
```

### 3. **Conflict Warnings**
```
⚠️ Warning: You're about to remove "View Patient Records" permission from Dr. Sarah,
but she has department access to Cardiology. This may cause access issues.
[Remove Anyway] [Also Remove Department Access] [Cancel]
```

### 4. **Validation**
```
✓ 154 permissions loaded
✓ 21 roles loaded
✓ 45 users with department access
⚠️ 3 users have orphaned permissions (role deleted)
❌ 2 users have no department access
```

### 5. **Undo/Redo**
- Changes staged but not saved until "Save All"
- [Undo Last Change] button available
- "You have unsaved changes" warning on navigation

---

## Search and Filter Capabilities

### Global Search Bar:
```
[🔍 Search across all permissions, users, departments...]

Results:
  Users (5):
    - Dr. Sarah Johnson (Cardiology)
    - Sarah Williams (Receptionist)
  
  Departments (2):
    - Cardiology
    - Cardiac Rehabilitation
  
  Permissions (3):
    - View patient records
    - Create patient records
    - Edit patient records
```

### Advanced Filters:
```
┌─── FILTERS ───────────────────────────────────────┐
│ User Status:   ☑ Active  ☐ Inactive  ☐ Pending   │
│ Role:          [All Roles ▼]                      │
│ Department:    [All Departments ▼]                │
│ Has Access To: [Any Department ▼]                 │
│ Permission:    [Specific Permission ▼]            │
│                                                    │
│ [Apply Filters]  [Reset]                          │
└────────────────────────────────────────────────────┘
```

---

## Mobile Responsiveness

### For Tablets:
- Collapse department tree into dropdown
- Stack permission matrix vertically
- Swipe gestures for navigation

### For Phones:
- Simplified list view
- One user/department at a time
- Bottom sheet for editing

---

## Keyboard Shortcuts

- `Ctrl+F` - Quick search
- `Ctrl+S` - Save all changes
- `Ctrl+Z` - Undo last change
- `Tab` - Navigate checkboxes
- `Space` - Toggle selected checkbox
- `Ctrl+A` - Select all in current view
- `Esc` - Cancel/close modal

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Tab 1: Role Permissions matrix
2. Save/load permissions from API
3. Basic checkbox toggles

### Phase 2: Core Functionality (Week 2)
1. Tab 2: User Access view
2. Department selection tree
3. Effective access summary

### Phase 3: Advanced Features (Week 3)
1. Tab 3: Department Access matrix
2. Two-way view toggle
3. Bulk selection

### Phase 4: Bulk Operations (Week 4)
1. Tab 4: Bulk operations wizard
2. Copy user access
3. Import/export

### Phase 5: Polish (Week 5)
1. Search and filters
2. Conflict warnings
3. Smart suggestions
4. Mobile responsiveness

---

## Technical Considerations

### State Management:
```typescript
interface PermissionsState {
  roles: Role[];
  permissions: Permission[];
  users: User[];
  departments: Department[];
  rolePermissions: Map<roleId, permissionId[]>;
  userDepartments: Map<userId, departmentId[]>;
  userOverrides: Map<userId, {added: permissionId[], revoked: permissionId[]}>;
  pendingChanges: Change[];
  isDirty: boolean;
}
```

### API Endpoints Needed:
```
GET  /api/permissions/matrix           - Full matrix view
POST /api/permissions/role/:id         - Update role permissions
POST /api/permissions/user/:id         - Update user overrides
POST /api/departments/user/:id/access  - Update department access
POST /api/permissions/bulk             - Bulk operations
```

### Performance Optimizations:
- Virtual scrolling for large lists (1000+ users)
- Debounced search (300ms delay)
- Optimistic UI updates
- Batch API calls (max 50 changes at once)
- Cache department tree structure
- Lazy load sub-departments

---

## User Experience Enhancements

### 1. **Onboarding Tour**
```
Step 1: "Welcome! This is where you manage who can do what in the system."
Step 2: "Role Permissions define what actions each role can perform."
Step 3: "Department Access controls which data users can see."
Step 4: "Use tabs to switch between different management views."
```

### 2. **Contextual Help**
- Hover tooltips on all labels
- "?" icons with detailed explanations
- Link to full documentation
- Video tutorials for complex operations

### 3. **Audit Trail**
```
┌─── RECENT CHANGES ─────────────────────────────────┐
│ 2 minutes ago - You granted Emergency Medicine     │
│                 access to Dr. Sarah Johnson         │
│                                                     │
│ 5 minutes ago - You removed "Delete Users"         │
│                 permission from Nurse role          │
│                                                     │
│ [View Full Audit Log →]                            │
└─────────────────────────────────────────────────────┘
```

### 4. **Smart Defaults**
- Pre-select user's primary department
- Suggest commonly paired permissions
- Auto-include parent department when selecting sub-department
- Remember last used filters

---

## Summary

This unified design gives you **FOUR ways** to manage the same data:

1. **By Role** - "All doctors should be able to do X"
2. **By User** - "What can Dr. Sarah do and where?"
3. **By Department** - "Who can access Cardiology data?"
4. **Bulk** - "Grant emergency access to 20 doctors"

All tabs modify the **same underlying data** - just different views and workflows for different administrative tasks.

**Next Steps:**
1. Review this design
2. Prioritize which tabs to build first
3. I'll implement the chosen tab(s) with full functionality
