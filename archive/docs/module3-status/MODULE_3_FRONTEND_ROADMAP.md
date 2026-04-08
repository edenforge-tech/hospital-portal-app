# Module 3 Frontend Development Roadmap

## Overview
This document outlines the comprehensive frontend development plan for all 5 Module 3 Counselor modules. Backend is 100% complete with 58 endpoints. Frontend will integrate with existing API infrastructure.

## Current Frontend Status
- **Existing**: Auth, Dashboard, Users, Branches, Tenants
- **Pending**: Modules 3.6-3.10 (Insurance, Payments, Admissions, Consents, Workflow)
- **Architecture**: Next.js 13.5.1 with App Router, Tailwind CSS, shadcn/ui  
- **State Management**: Zustand for auth, React Query for data fetching
- **Package Manager**: pnpm (NOT npm!)

## Module 3 Integration Points

### Shared Infrastructure (Already Complete)
- ✅ API Client: `src/lib/api.ts` - Axios with tenant ID + JWT interceptors
- ✅ Auth Store: `src/lib/auth-store.ts` - Manages tokens and tenant context
- ✅ Base Layout: `src/app/dashboard/layout.tsx` - Sidebar navigation
- ✅ UI Components: shadcn/ui library (Button, Dialog, Table, Form, etc.)

### API Endpoints Available
**Module 3.6 Insurance**: 9 endpoints  
**Module 3.7 Payments**: 18 endpoints  
**Module 3.8 Admissions**: 11 endpoints  
**Module 3.9 Consents**: 11 endpoints  
**Module 3.10 Workflow**: 9 endpoints

## Development Plan by Module

### Phase 1: Module 3.6 Insurance (Highest Priority)
**Estimated Time**: 6-8 hours

#### Pages to Create:
1. **`src/app/dashboard/counselor/insurance/page.tsx`** - Insurance Dashboard
   - Pre-authorizations list table
   - Claims list table
   - TPA provider filter
   - Status filters (Pending, Approved, Rejected, Under Review)
   - Quick stats cards (Total Requests, Approved Amount, Pending Count)

2. **`src/app/dashboard/counselor/insurance/pre-auth/page.tsx`** - Pre-Auth Management
   - Create pre-authorization form
   - Edit existing pre-authorization
   - Document upload for medical records
   - Status tracking timeline component
   - Approval/rejection workflow

3. **`src/app/dashboard/counselor/insurance/claims/page.tsx`** - Claims Processing
   - Submit insurance claim form
   - Link to pre-authorization
   - Itemized billing breakdown
   - Claim status tracking
   - Settlement amount calculation

#### Components to Build:
- `InsurancePreAuthForm.tsx` - Multi-step form (Patient Info → Insurance Details → Medical Details → Documents)
- `ClaimsTable.tsx` - Sortable, filterable claims table
- `PreAuthStatusBadge.tsx` - Status indicator with color coding
- `TPAProviderSelect.tsx` - Dropdown with TPA companies
- `InsuranceDocumentUpload.tsx` - Multi-file upload with preview

#### API Hooks:
```typescript
// src/hooks/use-insurance.ts
export function usePreAuths() { ... }
export function useCreatePreAuth() { ... }
export function useUpdatePreAuth() { ... }
export function useClaims() { ... }
export function useCreateClaim() { ... }
```

### Phase 2: Module 3.7 Payments (High Priority)
**Estimated Time**: 8-10 hours

#### Pages to Create:
1. **`src/app/dashboard/counselor/payments/page.tsx`** - Payment Dashboard
   - Payment transactions table
   - Payment links management
   - Government scheme claims
   - Revenue charts (daily, weekly, monthly)
   - Payment method distribution

2. **`src/app/dashboard/counselor/payments/transactions/page.tsx`** - Transaction Management
   - Create payment transaction
   - Receipt generation
   - Refund processing
   - Payment reconciliation

3. **`src/app/dashboard/counselor/payments/links/page.tsx`** - Payment Links
   - Generate payment link with QR code
   - Send via SMS/Email/WhatsApp
   - Track link status (Active, Paid, Expired)
   - Reminder management

4. **`src/app/dashboard/counselor/payments/government-schemes/page.tsx`** - Government Claims
   - Ayushman Bharat integration
   - State scheme processing
   - Claim tracking
   - Reimbursement management

#### Components to Build:
- `PaymentForm.tsx` - Multi-payment method form (Cash, Card, UPI, NEFT)
- `PaymentLinkGenerator.tsx` - Generate link with customizable amount and expiry
- `QRCodeDisplay.tsx` - Display payment QR code
- `PaymentReceipt.tsx` - Printable receipt component
- `GovernmentSchemeForm.tsx` - Scheme-specific claim form

#### API Hooks:
```typescript
// src/hooks/use-payments.ts
export function usePayments() { ... }
export function useCreatePayment() { ... }
export function usePaymentLinks() { ... }
export function useGeneratePaymentLink() { ... }
export function useGovernmentClaims() { ... }
```

### Phase 3: Module 3.8 Admissions (High Priority)
**Estimated Time**: 6-8 hours

#### Pages to Create:
1. **`src/app/dashboard/counselor/admissions/page.tsx`** - Admissions Dashboard
   - Day Care admissions list
   - IPD admissions list
   - Emergency admissions list
   - Bed occupancy overview
   - Admission calendar view

2. **`src/app/dashboard/counselor/admissions/day-care/page.tsx`** - Day Care Admissions
   - Schedule day care admission
   - Pre-op checklist
   - Discharge planning

3. **`src/app/dashboard/counselor/admissions/ipd/page.tsx`** - IPD Admissions
   - Full admission form
   - Bed allocation
   - Multi-day planning

4. **`src/app/dashboard/counselor/admissions/emergency/page.tsx`** - Emergency Admissions
   - Quick admission form
   - Priority flags
   - Immediate bed allocation

5. **`src/app/dashboard/counselor/admissions/beds/page.tsx`** - Bed Management
   - Create bed reservation
   - Release/transfer beds
   - Real-time availability

#### Components to Build:
- `AdmissionForm.tsx` - Type-specific admission forms
- `BedSelector.tsx` - Interactive bed selection with availability
- `PreOpChecklist.tsx` - Checklist component
- `AdmissionTimeline.tsx` - Admission → Surgery → Discharge timeline
- `BedReservationCalendar.tsx` - Calendar view of bed bookings

#### API Hooks:
```typescript
// src/hooks/use-admissions.ts
export function useAdmissions() { ... }
export function useCreateAdmission() { ... }
export function useBedReservations() { ... }
export function useCreateBedReservation() { ... }
```

### Phase 4: Module 3.9 Consents (Medium Priority)
**Estimated Time**: 6-8 hours

#### Pages to Create:
1. **`src/app/dashboard/counselor/consents/page.tsx`** - Consent Dashboard
   - Patient consents list
   - Template library
   - Signature status tracking

2. **`src/app/dashboard/counselor/consents/templates/page.tsx`** - Template Management
   - Create/edit consent templates
   - HTML template editor
   - Placeholder management
   - Category organization

3. **`src/app/dashboard/counselor/consents/render/page.tsx`** - Render & Sign
   - Patient consent rendering
   - Digital signature capture
   - Witness signature
   - Guardian signature
   - PDF generation

#### Components to Build:
- `ConsentTemplateEditor.tsx` - Rich text editor with placeholders
- `ConsentRenderer.tsx` - Render template with patient data
- `SignaturePad.tsx` - Digital signature capture (canvas-based)
- `ConsentPDFViewer.tsx` - PDF preview and download
- `ConsentStatusBadge.tsx` - Status indicator

#### API Hooks:
```typescript
// src/hooks/use-consents.ts
export function useConsentTemplates() { ... }
export function useCreateTemplate() { ... }
export function useRenderConsent() { ... }
export function useSignConsent() { ... }
export function useConsents() { ... }
```

### Phase 5: Module 3.10 Workflow (Medium Priority)
**Estimated Time**: 6-8 hours

#### Pages to Create:
1. **`src/app/dashboard/counselor/workflow/page.tsx`** - Workflow Dashboard
   - Active workflows list
   - Progress overview
   - Bottleneck identification
   - SLA tracking

2. **`src/app/dashboard/counselor/workflow/details/[id]/page.tsx`** - Workflow Details
   - Stage progression view
   - Dependency management
   - Manual stage advancement
   - Auto-progression monitoring

3. **`src/app/dashboard/counselor/workflow/milestones/page.tsx`** - Milestones Tracking
   - Milestone achievement view
   - Progress percentage
   - Pending stages visualization

#### Components to Build:
- `WorkflowProgressBar.tsx` - Visual progress indicator
- `WorkflowStageCard.tsx` - Individual stage card with status
- `WorkflowTimeline.tsx` - Timeline view of stage transitions
- `StageDependencyGraph.tsx` - Visual dependency graph
- `MilestoneTracker.tsx` - Milestone achievement tracker

#### API Hooks:
```typescript
// src/hooks/use-workflows.ts
export function useWorkflows() { ... }
export function useInitializeWorkflow() { ... }
export function useWorkflowProgress() { ... }
export function useUpdateStage() { ... }
export function useStageTransitions() { ... }
```

## Shared Components Library

### Create Reusable Components:
1. **`src/components/counselor/SessionSelector.tsx`**
   - Dropdown to select counseling session
   - Used across all modules

2. **`src/components/counselor/PatientCard.tsx`**
   - Display patient details
   - Quick access to patient info

3. **`src/components/counselor/StatusBadge.tsx`**
   - Unified status badge component
   - Color-coded by status type

4. **`src/components/counselor/DataTable.tsx`**
   - Generic sortable, filterable table
   - Pagination support
   - Export to CSV/Excel

5. **`src/components/counselor/FormStepper.tsx`**
   - Multi-step form navigation
   - Progress indicator

## Implementation Strategy

### Week 1: Foundation (Days 1-2)
- ✅ Set up shared components library
- ✅ Create API hooks structure
- ✅ Design navigation structure
- ✅ Implement session/patient selection components

### Week 2: Module 3.6 Insurance (Days 3-5)
- ✅ Build pre-authorization pages
- ✅ Build claims processing pages
- ✅ Integrate with backend APIs
- ✅ Test end-to-end workflows

### Week 3: Module 3.7 Payments (Days 6-9)
- ✅ Build payment transaction pages
- ✅ Build payment link generation
- ✅ Build government scheme pages
- ✅ Integrate payment gateway (Razorpay)

### Week 4: Module 3.8 Admissions (Days 10-12)
- ✅ Build admission pages (Day Care, IPD, Emergency)
- ✅ Build bed management system
- ✅ Integrate with calendar/scheduling

### Week 5: Module 3.9 Consents (Days 13-15)
- ✅ Build template management
- ✅ Build consent rendering
- ✅ Implement digital signatures
- ✅ PDF generation

### Week 6: Module 3.10 Workflow (Days 16-18)
- ✅ Build workflow dashboard
- ✅ Build stage management
- ✅ Build progress tracking
- ✅ Integrate with all modules

### Week 7: Testing & Polish (Days 19-21)
- ✅ End-to-end integration testing
- ✅ UI/UX refinements
- ✅ Performance optimization
- ✅ Accessibility improvements
- ✅ Documentation

## Technical Specifications

### Styling Guidelines:
- **Tailwind CSS**: Use utility-first approach
- **shadcn/ui**: Leverage existing component library
- **Color Scheme**: Follow existing Hospital Portal design system
- **Responsive**: Mobile-first design (sm, md, lg, xl breakpoints)

### Form Validation:
- **Library**: React Hook Form + Zod
- **Patterns**: Frontend validation + backend confirmation
- **Error Handling**: User-friendly error messages

### Data Fetching:
- **Library**: React Query (TanStack Query)
- **Patterns**: Automatic caching, revalidation, optimistic updates
- **Loading States**: Skeleton loaders for better UX

### State Management:
- **Global**: Zustand (auth, user, tenant)
- **Server State**: React Query (API data)
- **Form State**: React Hook Form
- **UI State**: Local component state

### File Structure:
```
apps/hospital-portal-web/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── counselor/
│   │           ├── insurance/
│   │           ├── payments/
│   │           ├── admissions/
│   │           ├── consents/
│   │           └── workflow/
│   ├── components/
│   │   └── counselor/
│   ├── hooks/
│   │   ├── use-insurance.ts
│   │   ├── use-payments.ts
│   │   ├── use-admissions.ts
│   │   ├── use-consents.ts
│   │   └── use-workflows.ts
│   ├── lib/
│   │   ├── api.ts (existing)
│   │   └── auth-store.ts (existing)
│   └── types/
│       └── counselor.ts
```

## Testing Strategy

### Unit Tests:
- Individual component testing
- API hook testing
- Form validation testing

### Integration Tests:
- Module-to-module interaction tests
- API integration tests
- User flow tests

### E2E Tests:
- Complete counseling workflow
- Session → Package → Insurance → Payment → Consent → Admission

## Performance Considerations

### Optimization Techniques:
1. **Code Splitting**: Lazy load module pages
2. **Image Optimization**: Next.js Image component
3. **Data Caching**: React Query with stale-while-revalidate
4. **Virtual Scrolling**: For long lists (react-window)
5. **Debouncing**: Search inputs, filter controls

### Bundle Size Monitoring:
- Target: <200KB initial load
- Use `next/bundle-analyzer` for monitoring
- Tree-shake unused code

## Accessibility (WCAG 2.1 AA)

### Requirements:
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Focus indicators
- Color contrast ratios (4.5:1 minimum)
- Form error announcements

## Browser Support

### Target Browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS Safari 14+, Chrome Android 90+

## Documentation

### Create Documentation:
1. **User Guide**: Step-by-step module usage
2. **Developer Guide**: Component API documentation
3. **Integration Guide**: Backend API integration examples
4. **Troubleshooting**: Common issues and solutions

## Deployment

### Build Process:
```bash
cd apps/hospital-portal-web
pnpm install
pnpm build
pnpm start  # Production server
```

### Environment Variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5073/api
NEXT_PUBLIC_RAZORPAY_KEY=<key>
NEXT_PUBLIC_AZURE_STORAGE_URL=<url>
```

## Success Criteria

### Module 3 Frontend Complete When:
- ✅ All 5 modules have functional UIs
- ✅ All 58 backend endpoints integrated
- ✅ End-to-end counseling workflow works
- ✅ Unit test coverage >80%
- ✅ Performance: Load time <3s, FCP <1.5s
- ✅ Accessibility: WCAG 2.1 AA compliance
- ✅ Mobile responsive on all pages
- ✅ Documentation complete

## Next Steps (After Module 3)

1. **Module 4 Frontend**: Front Office/OPD (Queue TV, Visitor Management)
2. **Module 1 Frontend**: Doctor Desk (Examinations, Prescriptions)
3. **Advanced Features**:
   - Real-time notifications (SignalR)
   - Offline mode (PWA)
   - Analytics dashboard
   - Reporting module

---

**Status**: 📋 Frontend Development Roadmap Complete  
**Priority**: 🔴 HIGH - Critical for system usability  
**Estimated Total Time**: 32-42 hours (4-6 days for experienced developer)  
**Dependencies**: ✅ Backend complete, ✅ API infrastructure ready, ✅ UI library configured

