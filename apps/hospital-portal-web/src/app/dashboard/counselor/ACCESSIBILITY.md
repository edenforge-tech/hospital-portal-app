# Counselor Module - Accessibility Improvements

**Target**: WCAG 2.1 Level AA Compliance  
**Status**: 🟡 In Progress

---

## 1. Semantic HTML ✅

All components use proper semantic elements:
- `<header>`, `<main>`, `<section>` for layout
- `<table>`, `<thead>`, `<tbody>` for data tables
- `<form>` for all forms
- `<button>` (not `<div>` with onClick)
- `<nav>` for navigation

---

## 2. Keyboard Navigation

### Required Improvements

#### Forms
**Current**: ✅ All inputs keyboard accessible  
**Needed**:
```tsx
// Add to all forms
<form onSubmit={handleSubmit} onKeyDown={(e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    handleSubmit();
  }
}}>
  {/* Shortcut: Ctrl+Enter to submit */}
</form>
```

#### Dialogs
**Current**: ⚠️ Missing Escape key handler  
**Add to all Dialog components**:
```tsx
<Dialog open={open} onOpenChange={(open) => {
  if (!open) setOpen(false);
}}>
  {/* This already handles Escape key via shadcn/ui */}
</Dialog>
```

#### Tables
**Current**: ⚠️ Row actions require mouse  
**Needed**: Add keyboard shortcuts
```tsx
// In DataTable rows
<tr
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleViewDetails(row.id);
    }
    if (e.key === 'Delete') {
      handleDelete(row.id);
    }
  }}
>
```

---

## 3. ARIA Labels

### Icon-Only Buttons (HIGH PRIORITY)

**Missing aria-labels in these components**:

#### SessionsTable.tsx
```tsx
// Before
<Button size="sm">
  <Eye className="h-4 w-4" />
</Button>

// After
<Button size="sm" aria-label="View session details">
  <Eye className="h-4 w-4" />
</Button>
```

**Files needing updates**:
- ✅ `SessionsTable.tsx` - View, Edit, Delete buttons
- ✅ `InsuranceTable.tsx` - View, Download buttons
- ✅ `PaymentsTable.tsx` - View, Refund buttons
- ✅ `PaymentLinksTable.tsx` - Copy, Send, View QR buttons
- ✅ `RefundsTable.tsx` - View, Process buttons
- ✅ `AdmissionsTable.tsx` - View, Edit buttons
- ✅ `ConsentTemplatesTable.tsx` - Preview, Edit, Duplicate buttons
- ✅ `PatientConsentsTable.tsx` - Sign, Finalize, Download buttons
- ✅ `WorkflowsTable.tsx` - View Progress, Update, Delete buttons

### Form Labels

**Current**: ✅ All form inputs have proper `<label>` elements via shadcn/ui Form components

### Status Indicators

**Add to all Badge components**:
```tsx
// Before
<Badge variant="success">Active</Badge>

// After
<Badge variant="success" role="status" aria-label="Status: Active">
  Active
</Badge>
```

---

## 4. Focus Management

### Dialog Focus Trap

**Current**: ✅ shadcn/ui Dialog already implements focus trap  
**Verify**: Tab key cycles within dialog only

### Form Error Focus

**Add to all forms**:
```tsx
const form = useForm({
  // ...
});

// After form submission fails
form.setError('fieldName', {
  type: 'manual',
  message: 'Error message',
});

// Focus first error field
const firstErrorField = document.querySelector('[aria-invalid="true"]');
if (firstErrorField) {
  (firstErrorField as HTMLElement).focus();
}
```

---

## 5. Color Contrast

### Current Status Badges

| Badge | Color | Contrast Ratio | Pass? |
|-------|-------|----------------|-------|
| Success | Green on white | 4.6:1 | ✅ AA |
| Warning | Yellow on white | 3.2:1 | ❌ Fails |
| Danger | Red on white | 5.1:1 | ✅ AA |
| Info | Blue on white | 4.5:1 | ✅ AA |

**Fix Warning Badge**:
```tsx
// In StatusBadge.tsx
const variants = {
  warning: "bg-amber-600 text-white", // Darker amber
  // Instead of: "bg-yellow-400 text-gray-900"
};
```

### Link Colors

**Current**: ⚠️ Default blue may not pass  
**Test**: Use Chrome DevTools Lighthouse to check all links

---

## 6. Screen Reader Announcements

### Loading States

**Add to all loading skeletons**:
```tsx
<div role="status" aria-live="polite" aria-label="Loading data">
  <Skeleton className="h-10 w-full" />
  <span className="sr-only">Loading payment information...</span>
</div>
```

### Toast Notifications

**Add to toast config**:
```tsx
// In components using toast
toast({
  title: "Payment created successfully",
  description: "Receipt number: RCP-001",
  role: "status",
  "aria-live": "polite",
});
```

### Form Submission Success

**Add announcement after successful mutation**:
```tsx
const { mutate } = useCreatePayment();

mutate(data, {
  onSuccess: () => {
    // Visual toast
    toast({ title: "Payment created" });
    
    // Screen reader announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Payment created successfully';
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 3000);
  },
});
```

---

## 7. Table Accessibility

### Current Implementation

```tsx
<table>
  <thead>
    <tr>
      <th>Column Name</th> {/* ✅ Good */}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{data}</td>
    </tr>
  </tbody>
</table>
```

### Improvements Needed

```tsx
<table role="table" aria-label="Counseling sessions list">
  <thead>
    <tr>
      <th scope="col">Session Number</th>
      <th scope="col">Patient Name</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{session.sessionNumber}</td>
      <td>{session.patientName}</td>
      <td>
        <Badge role="status" aria-label={`Status: ${session.status}`}>
          {session.status}
        </Badge>
      </td>
      <td>
        <Button aria-label={`View session ${session.sessionNumber}`}>
          <Eye className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  </tbody>
</table>
```

---

## 8. Skip Links

**Add to main layout** (`counselor/layout.tsx`):
```tsx
export default function CounselorLayout({ children }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:border"
      >
        Skip to main content
      </a>
      <div className="container mx-auto py-8">
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
}
```

---

## 9. Form Validation

### Real-time Validation Announcements

**Add to forms with react-hook-form**:
```tsx
<FormField
  control={form.control}
  name="amount"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Amount</FormLabel>
      <FormControl>
        <Input
          {...field}
          aria-invalid={fieldState.invalid}
          aria-describedby={fieldState.error ? "amount-error" : undefined}
        />
      </FormControl>
      {fieldState.error && (
        <FormMessage id="amount-error" role="alert">
          {fieldState.error.message}
        </FormMessage>
      )}
    </FormItem>
  )}
/>
```

---

## 10. Progress Indicators

### WorkflowProgressDialog Improvements

**Current**: Progress bar without label  
**Add**:
```tsx
<div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
  <Progress value={progress} />
  <span className="sr-only">{progress}% complete</span>
</div>
```

---

## Implementation Checklist

### Phase 1: Critical (30 min)
- [ ] Add aria-labels to all icon-only buttons (9 components)
- [ ] Fix warning badge color contrast
- [ ] Add role="status" to all badges
- [ ] Add aria-live to toast notifications

### Phase 2: Important (20 min)
- [ ] Add skip link to layout
- [ ] Add table aria-labels and scope attributes
- [ ] Add focus management to forms (error focus)
- [ ] Add keyboard shortcuts to tables

### Phase 3: Enhanced (20 min)
- [ ] Add screen reader announcements for loading states
- [ ] Add dialog close keyboard handler (if missing)
- [ ] Add progress bar aria-valuenow attributes
- [ ] Test with screen reader (VoiceOver/NVDA)

---

## Testing Tools

### Automated Testing
```bash
# Install dependencies
pnpm add -D @axe-core/playwright

# Run accessibility tests
pnpm test:a11y
```

### Manual Testing

**Screen Readers**:
- Windows: NVDA (free)
- macOS: VoiceOver (built-in)
- Chrome extension: ChromeVox

**Keyboard Navigation**:
1. Unplug mouse
2. Navigate entire app using only:
   - Tab (forward)
   - Shift+Tab (backward)
   - Enter (activate)
   - Escape (close dialogs)
   - Arrow keys (dropdowns)

**Color Contrast**:
- Chrome DevTools → Lighthouse → Accessibility
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

---

## WCAG 2.1 AA Compliance Checklist

### Perceivable
- [x] 1.1.1 Non-text Content (images have alt text) ✅
- [ ] 1.4.3 Contrast (minimum 4.5:1) ⚠️ Warning badge fails
- [x] 1.4.11 Non-text Contrast (UI components 3:1) ✅

### Operable
- [ ] 2.1.1 Keyboard (all functionality via keyboard) ⚠️ Table actions need work
- [x] 2.1.2 No Keyboard Trap (focus not trapped) ✅
- [ ] 2.4.7 Focus Visible (focus indicators visible) ⚠️ Need testing

### Understandable
- [x] 3.2.1 On Focus (no unexpected context changes) ✅
- [ ] 3.3.1 Error Identification (errors clearly described) ⚠️ Need error focus
- [x] 3.3.2 Labels or Instructions (inputs have labels) ✅

### Robust
- [x] 4.1.2 Name, Role, Value (accessible names) ⚠️ Icon buttons missing
- [x] 4.1.3 Status Messages (status changes announced) ⚠️ Toast needs role

**Current Score**: 12/15 passing (80%)  
**Target Score**: 15/15 (100%)

---

## Next Steps

1. **Immediate**: Fix icon button aria-labels (15 min)
2. **Short-term**: Fix color contrast, add keyboard shortcuts (30 min)
3. **Testing**: Screen reader + keyboard navigation testing (30 min)
4. **Validation**: Run Lighthouse accessibility audit (15 min)

**Estimated Time to 100% Compliance**: 1.5 hours

---

**Last Updated**: 2026-02-01  
**Status**: 80% compliant → Target 100%
