# SignalR Integration Testing Guide - Module 4 Step 3

**Date**: February 5, 2026  
**Status**: IMPLEMENTATION COMPLETE ✅  
**Next**: Manual Testing Required

---

## 🎯 WHAT WAS IMPLEMENTED

### 1. Backend SignalR Hub (Already Existed) ✅

**File**: `microservices/auth-service/AuthService/Hubs/QueueHub.cs`

**Methods Available**:
- `SubscribeToQueue(Guid branchId, Guid? departmentId, string queueType)` - Subscribe to specific queue updates
- `UnsubscribeFromQueue(Guid branchId, Guid? departmentId, string queueType)` - Unsubscribe from queue
- `SubscribeToBranch(Guid branchId)` - Subscribe to all queues in a branch (for dashboard)

**Events Broadcasted**:
- `TokenCalled` - When a patient is called (includes token number, room, doctor)
- `QueueUpdate` - When queue status changes (add, remove, transfer)
- `SubscriptionConfirmed` - Confirmation of successful subscription
- `BranchSubscriptionConfirmed` - Confirmation for branch-wide subscription

**Endpoint**: `http://localhost:5073/hubs/queue`

---

### 2. Frontend Components Updated ✅

#### **A. QueueDisplayTV.tsx** (Queue TV Display)

**Changes**:
- ✅ Replaced `socket.io-client` with `@microsoft/signalr`
- ✅ Added SignalR HubConnection setup
- ✅ Auto-connect to `/hubs/queue` endpoint
- ✅ Subscribe to specific queue using `SubscribeToQueue(branchId, departmentId, queueType)`
- ✅ Listen for `TokenCalled` event → Update current token display
- ✅ Listen for `QueueUpdate` event → Refresh queue data
- ✅ Auto-reconnect on connection drop
- ✅ Unsubscribe on component unmount

**File**: `apps/hospital-portal-web/src/components/frontdesk/QueueDisplayTV.tsx`

**Lines Modified**: 1-90 (entire WebSocket section)

---

#### **B. QueueDashboard.tsx** (Front Desk Dashboard)

**Changes**:
- ✅ Added `@microsoft/signalr` import
- ✅ Added SignalR HubConnection setup
- ✅ Auto-connect to `/hubs/queue` endpoint  
- ✅ Subscribe to branch-wide updates using `SubscribeToBranch(branchId)`
- ✅ Listen for `QueueUpdate` event → Refresh dashboard
- ✅ Listen for `TokenCalled` event → Refresh dashboard
- ✅ Reduced polling interval from 5s to 30s (now has real-time updates)
- ✅ Auto-reconnect on connection drop

**File**: `apps/hospital-portal-web/src/components/frontdesk/QueueDashboard.tsx`

**Lines Modified**: 1-150 (imports + connection setup)

---

### 3. Backend Broadcasting (Already Existed) ✅

**File**: `microservices/auth-service/AuthService/Services/QueueService.cs`

**Method**: `CallPatientAsync()` (Lines 110-160)

**What Happens When Patient is Called**:
1. Update database: `status = "called"`, set `calledAt`, `roomNumber`, `doctorName`
2. **Broadcast 1**: Send `TokenCalled` to specific queue group
   - Target: `Queue-{tenantId}-{branchId}-{departmentId}-{queueType}`
   - Data: Token number, room, doctor, time
   - Receivers: **Queue TV displays** for that specific queue
3. **Broadcast 2**: Send `QueueUpdate` to branch group
   - Target: `Branch-{tenantId}-{branchId}`
   - Data: Queue item ID, status change action
   - Receivers: **Front desk dashboards** for that branch

**Result**: All connected clients receive real-time updates without polling!

---

## 🧪 TESTING INSTRUCTIONS

### **Prerequisites**

1. ✅ Backend running on `http://localhost:5073`
2. ✅ Frontend running on `http://localhost:3000`
3. ✅ Valid JWT token (login first)
4. ✅ `branchId` stored in localStorage

### **Test 1: Queue TV Display Real-time Updates**

**Goal**: Verify Queue TV receives real-time token calls

**Steps**:
1. **Open Queue TV Display**:
   ```
   http://localhost:3000/dashboard/frontdesk/queue-tv?branchId={BRANCH_ID}&queueType=Doctor
   ```

2. **Check Browser Console**:
   ```
   Expected logs:
   ✓ "Queue Display: Connected to SignalR"
   ✓ "Queue Display: Subscription confirmed" { branchId, queueType }
   ```

3. **Open Queue Dashboard** (in separate tab/window):
   ```
   http://localhost:3000/dashboard/frontdesk/queue
   ```

4. **Call a Patient** from the dashboard:
   - Click "Call Patient" button for any waiting patient
   - Watch the Queue TV Display tab

5. **Verify**:
   - ✅ Console shows: `"Queue Display: Token called"` with token number
   - ✅ Queue TV updates **immediately** (no delay)
   - ✅ Current token changes to the called patient
   - ✅ Doctor name and room number update

**Expected Result**: Queue TV updates in real-time (<1 second latency)

---

### **Test 2: Dashboard Real-time Updates**

**Goal**: Verify dashboard receives real-time queue updates

**Steps**:
1. **Open Queue Dashboard**:
   ```
   http://localhost:3000/dashboard/frontdesk/queue
   ```

2. **Check Browser Console**:
   ```
   Expected logs:
   ✓ "Queue Dashboard: Connected to SignalR"
   ✓ "Queue Dashboard: Subscription confirmed" { branchId }
   ```

3. **Call a Patient**:
   - Click "Call Patient" for any patient in waiting state

4. **Verify**:
   - ✅ Console shows: `"Queue Dashboard: Token called"` or `"Queue Dashboard: Received queue update"`
   - ✅ Dashboard refreshes automatically
   - ✅ Patient status changes from "waiting" to "called"
   - ✅ Queue counts update without manual refresh

**Expected Result**: Dashboard updates in real-time without full page reload

---

### **Test 3: Multi-Tab Synchronization**

**Goal**: Verify all connected clients receive updates

**Steps**:
1. **Open 3 Browser Tabs**:
   - Tab 1: Queue TV for Doctor queue
   - Tab 2: Queue Dashboard (Front Desk)
   - Tab 3: Queue TV for same Doctor queue (duplicate)

2. **Call a Patient** from Tab 2 (Dashboard)

3. **Verify All Tabs**:
   - ✅ Tab 1 (Queue TV): Updates immediately
   - ✅ Tab 2 (Dashboard): Refreshes queue list
   - ✅ Tab 3 (Queue TV duplicate): Updates simultaneously with Tab 1

**Expected Result**: All tabs synchronized in real-time

---

### **Test 4: Reconnection After Network Loss**

**Goal**: Verify auto-reconnect works

**Steps**:
1. **Open Queue TV or Dashboard**
2. **Verify Connected**: Console shows "Connected to SignalR"
3. **Simulate Network Loss**:
   - Open browser DevTools → Network tab
   - Set throttling to "Offline"
   - Wait 2 seconds
4. **Restore Network**:
   - Set throttling back to "No throttling"
   - Wait 5 seconds
5. **Verify**:
   - ✅ Console shows: `"Reconnecting..."`
   - ✅ Console shows: `"Reconnected"`
   - ✅ Console shows: `"Subscription confirmed"` (resubscribed automatically)
   - ✅ Updates resume working

**Expected Result**: Auto-reconnect and resubscribe without page refresh

---

### **Test 5: Tenant Isolation**

**Goal**: Verify users only receive updates for their tenant

**Steps**:
1. **Login as Tenant A User** → Open Queue Dashboard
2. **Login as Tenant B User** (different browser/incognito) → Open Queue Dashboard
3. **Call Patient in Tenant A**
4. **Verify**:
   - ✅ Tenant A dashboard updates
   - ✅ Tenant B dashboard does NOT update (no cross-tenant leakage)

**Expected Result**: Updates scoped to tenant only (security test)

---

## 🐛 TROUBLESHOOTING

### **Issue 1: "SignalR connection error" in console**

**Possible Causes**:
- Backend not running
- JWT token expired or missing
- CORS issues

**Solution**:
```bash
# 1. Verify backend is running
cd "C:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
dotnet run

# 2. Check token in localStorage
localStorage.getItem('token')  # Run in browser console

# 3. Re-login if token expired
http://localhost:3000/login
```

---

### **Issue 2: Connection succeeds but no updates received**

**Possible Causes**:
- Not subscribed to correct queue/branch
- `branchId` or `departmentId` mismatch
- Backend not broadcasting events

**Solution**:
```javascript
// Run in browser console to check subscription:
connection.invoke('SubscribeToQueue', 'BRANCH_ID', 'DEPARTMENT_ID', 'Doctor')
  .then(() => console.log('Subscribed!'))
  .catch(err => console.error('Subscription failed:', err));
```

**Check Backend Logs**:
```bash
# Look for SignalR event emission logs in backend console:
"SignalR event emitted for token {TokenNumber}"
```

---

### **Issue 3: Updates received but UI not rendering**

**Possible Causes**:
- State not updating correctly
- React rendering issue

**Solution**:
```javascript
// Add debug logging in event handlers (already included):
connection.on('TokenCalled', (data) => {
  console.log('Received data:', data);  // Verify data structure
  // Check if state update triggers
});
```

---

### **Issue 4: "Cannot invoke 'SubscribeToQueue' - method not found"**

**Possible Causes**:
- Backend QueueHub not registered correctly
- Wrong hub URL

**Solution**:
```bash
# 1. Verify hub mapping in Program.cs:
# Should have: app.MapHub<QueueHub>("/hubs/queue");

# 2. Check hub URL in frontend:
# Should be: http://localhost:5073/hubs/queue
```

---

## 📊 SUCCESS CRITERIA

Step 3 is complete when:

- ✅ SignalR connection established (console logs confirm)
- ✅ Queue TV receives token calls in real-time (<1s latency)
- ✅ Dashboard receives queue updates in real-time
- ✅ Multi-tab synchronization works
- ✅ Auto-reconnect works after network loss
- ✅ No console errors related to SignalR
- ✅ Tenant isolation verified (no cross-tenant updates)

---

## 🔍 VERIFICATION CHECKLIST

**Before Testing**:
- [ ] Backend running (`dotnet run` in AuthService folder)
- [ ] Frontend running (`pnpm dev` in hospital-portal-web folder)
- [ ] Logged in with valid credentials
- [ ] BranchId available in localStorage
- [ ] Browser console open (F12)

**Test Results**:
- [ ] Test 1: Queue TV real-time updates ✅ / ❌
- [ ] Test 2: Dashboard real-time updates ✅ / ❌
- [ ] Test 3: Multi-tab synchronization ✅ / ❌
- [ ] Test 4: Auto-reconnect ✅ / ❌
- [ ] Test 5: Tenant isolation ✅ / ❌

**All Tests Pass?** → **Step 3 Complete** ✅ → Proceed to Step 4 (End-to-End Testing)

---

## 🚀 NEXT STEPS

**After Testing Passes**:

1. **Mark Step 3 Complete** ✅
2. **Update Module 4 Progress**: 95% → 97% (+2%)
3. **Proceed to Step 4**: End-to-End Testing (3 hours)
   - Test check-in workflows
   - Test walk-in booking
   - Test queue management
   - Test OPD reports

**Remaining Work**:
- Step 4: End-to-End Testing (3 hours)
- Step 5: Documentation & Polish (1 hour)
- **Total Remaining**: ~4 hours

---

## 📝 TECHNICAL NOTES

### **SignalR vs Socket.io**

**Why SignalR?**
- Better .NET Core integration (native support)
- Auto-reconnect built-in
- TypeScript support via `@microsoft/signalr`
- Server-side group management (tenant isolation)
- Connection state management

**Migration Summary**:
- ❌ Removed: `socket.io-client` dependency
- ✅ Using: `@microsoft/signalr` (version 9.0.6) - already installed
- ✅ Connection method: `HubConnectionBuilder`
- ✅ Events: `connection.on('EventName', callback)`
- ✅ Invoke methods: `connection.invoke('MethodName', ...args)`

### **Connection Flow**

```
1. Frontend connects to /hubs/queue with JWT token
   ↓
2. Backend validates token, extracts tenantId and userId
   ↓
3. Frontend calls SubscribeToQueue(branchId, departmentId, queueType)
   ↓
4. Backend adds connection to group: Queue-{tenantId}-{branchId}-{dept}-{type}
   ↓
5. Backend sends SubscriptionConfirmed event
   ↓
6. When patient called: Backend broadcasts TokenCalled to group
   ↓
7. All subscribed clients receive update instantly
```

### **Performance Considerations**

- **Polling Reduced**: Dashboard polling reduced from 5s to 30s (6x less load)
- **Real-time**: Updates arrive <1 second (vs 5 second polling delay)
- **Bandwidth**: Only sends changes (not full queue data every 5s)
- **Scalability**: Uses SignalR groups for efficient multi-user broadcasting

---

**Step 3 Implementation Complete**: February 5, 2026  
**Ready for Testing**: Manual verification required  
**Estimated Testing Time**: 30 minutes
