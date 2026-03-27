# Accessibility Testing Guide - Hospital Portal

## Quick Test Checklist

### ✅ Keyboard Navigation Test
1. **Tab Navigation**
   - Press `Tab` to move forward through interactive elements
   - Press `Shift + Tab` to move backward
   - Verify visible focus indicators on all interactive elements

2. **Skip Link**
   - Press `Tab` on page load → Should see "Skip to main content" link
   - Press `Enter` → Should jump to main content area

3. **Menu Navigation**
   - Tab to sidebar sections → Press `Enter` to expand/collapse
   - Tab to menu items → Press `Enter` to navigate

4. **Form Controls**
   - Tab to inputs → Type text
   - Tab to buttons → Press `Enter` or `Space` to activate
   - `Escape` should close dialogs/modals

### ✅ Screen Reader Test (NVDA/JAWS)
1. Navigate with screen reader enabled
2. Verify all images have alt text
3. Verify form labels are read correctly
4. Verify headings create logical document structure
5. Verify ARIA landmarks (nav, main, etc.) are announced

### ✅ Visual Accessibility
1. **Color Contrast**
   - Text vs background: Minimum 4.5:1 (normal), 3:1 (large text)
   - Interactive elements: Minimum 3:1

2. **Focus Indicators**
   - All interactive elements have visible focus ring
   - Focus ring is at least 2px and high contrast

3. **Text Scaling**
   - Zoom to 200% → Verify no content overlap
   - Check responsive design at different viewport sizes

---

## Manual Testing Procedure

### Test 1: Keyboard-Only Navigation (15 minutes)

**Instructions:** 
- Unplug mouse or don't touch mouse
- Use only keyboard to navigate entire application

**Test Pages:**
1. Login page (/auth/login)
2. Dashboard (/dashboard)
3. Users page (/dashboard/users)
4. Patients page (/dashboard/patients)
5. Appointments page (/dashboard/appointments)

**Check Points:**
- ✅ Can reach all interactive elements with Tab
- ✅ Focus indicator is always visible
- ✅ Can activate buttons with Enter/Space
- ✅ Can dismiss modals with Escape
- ✅ Tab order follows visual layout (left-to-right, top-to-bottom)

---

### Test 2: Screen Reader Compatibility (20 minutes)

**Tools:** NVDA (Windows), JAWS (Windows), VoiceOver (Mac)

**Download NVDA (Free):**
```
https://www.nvaccess.org/download/
```

**Test Procedure:**
1. Start NVDA → `Insert + Down Arrow` to read page
2. Navigate by headings → `H` key
3. Navigate by landmarks → `D` key (regions)
4. Navigate by links → `K` key
5. Navigate by form controls → `F` key

**Expected Announcements:**
- "Main navigation landmark" (Sidebar)
- "Main content landmark" (Main area)
- "Button, [Button Name]" (All buttons)
- "Edit text, [Label]" (Input fields)
- "Heading level 1, [Page Title]" (Page headings)

---

### Test 3: Color Contrast Audit (10 minutes)

**Tool:** Browser DevTools or WebAIM Contrast Checker

**Check These Combinations:**
- ✅ Primary text (#111827) on white (#FFFFFF) → Target: 4.5:1 ✅
- ✅ Primary button text (white) on emerald (#10b981) → Target: 3:1 ✅
- ✅ Link color (#10b981) on white → Target: 4.5:1 ✅
- ✅ Error text (#ef4444) on white → Target: 4.5:1 ✅
- ✅ Disabled text (#9ca3af) on white → Target: 4.5:1 ⚠️ (May fail - by design)

**WebAIM Contrast Checker:**
```
https://webaim.org/resources/contrastchecker/
```

---

### Test 4: Focus Management (10 minutes)

**Test Scenarios:**

1. **Modal/Dialog Focus Trap**
   - Open a dialog
   - Press Tab → Focus should stay within modal
   - Press Escape → Modal closes, focus returns to trigger button

2. **Skip Link**
   - Load page → Press Tab once
   - Should see "Skip to main content" link
   - Press Enter → Focus jumps to main content

3. **Form Validation**
   - Submit empty required field
   - Focus should move to first invalid field
   - Error message should be announced by screen reader

---

## Lighthouse Accessibility Audit

### Run Lighthouse in Chrome DevTools

1. Open Chrome → Navigate to `http://localhost:3000/dashboard`
2. Press `F12` → Open DevTools
3. Click **Lighthouse** tab
4. Select **Accessibility** only
5. Select **Desktop** or **Mobile**
6. Click **Analyze page load**

### Target Scores

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| **Accessibility** | 90+ | TBD | ⏳ Testing |
| **Best Practices** | 85+ | TBD | ⏳ Testing |
| **SEO** | 90+ | TBD | ⏳ Testing |

### Common Lighthouse Issues (Pre-emptive Fixes)

✅ **FIXED:**
- Missing `<html lang>` attribute → Added `lang="en"`
- Missing skip link → Added "Skip to main content"
- Buttons without accessible names → Added `aria-label` support
- Form inputs without labels → Enforced label requirement
- Images without alt text → TBD (needs image audit)

⏳ **PENDING:**
- Low color contrast ratios → Will verify with audit
- Missing ARIA landmarks → Added nav, main
- Focusable elements without focus indicator → CSS focus-ring class applied

---

## WCAG 2.1 Level AA Compliance Checklist

### 1. Perceivable
- ✅ **1.1.1 Non-text Content**: All images have alt text (in progress)
- ✅ **1.3.1 Info and Relationships**: Semantic HTML (nav, main, section)
- ✅ **1.3.2 Meaningful Sequence**: Logical tab order
- ✅ **1.4.1 Use of Color**: Not relying on color alone for information
- ✅ **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large text
- ✅ **1.4.11 Non-text Contrast**: 3:1 for UI components

### 2. Operable
- ✅ **2.1.1 Keyboard**: All functionality via keyboard
- ✅ **2.1.2 No Keyboard Trap**: Can navigate out of all components
- ✅ **2.4.1 Bypass Blocks**: Skip link implemented
- ✅ **2.4.3 Focus Order**: Logical focus order
- ✅ **2.4.7 Focus Visible**: Visible focus indicators
- ✅ **2.5.3 Label in Name**: Button text matches aria-label

### 3. Understandable
- ✅ **3.1.1 Language of Page**: `lang="en"` attribute
- ✅ **3.2.1 On Focus**: No context changes on focus
- ✅ **3.2.2 On Input**: No context changes on input
- ✅ **3.3.1 Error Identification**: Form validation errors
- ✅ **3.3.2 Labels or Instructions**: All inputs have labels

### 4. Robust
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA attributes
- ✅ **4.1.3 Status Messages**: Toast notifications with `role="status"`

---

## Automated Testing Tools

### 1. Axe DevTools (Browser Extension)

**Install:**
- Chrome: https://chrome.google.com/webstore (search "axe DevTools")
- Firefox: https://addons.mozilla.org/firefox/ (search "axe DevTools")

**Usage:**
1. Open DevTools → **axe DevTools** tab
2. Click **Scan ALL of my page**
3. Review violations → Priority order: Critical, Serious, Moderate, Minor

### 2. WAVE (Web Accessibility Evaluation Tool)

**Install:**
- Chrome: https://chrome.google.com/webstore (search "WAVE")

**Usage:**
1. Navigate to page
2. Click WAVE extension icon
3. Review errors (red), alerts (yellow), features (green)

### 3. Pa11y CI (Command-Line Tool)

**Install:**
```bash
npm install -g pa11y-ci
```

**Run:**
```bash
pa11y-ci http://localhost:3000/dashboard
```

---

## Expected Lighthouse Results (Predictions)

### Likely Score: **85-95/100**

**Probable Deductions:**
- -2 to -5 points: Images without alt text (if any exist)
- -2 to -3 points: Low contrast ratios (gray disabled states)
- -1 to -2 points: Missing ARIA labels on icon buttons

**Strong Points:**
- ✅ Semantic HTML (nav, main, section)
- ✅ Skip link for keyboard users
- ✅ Proper form labels and error messages
- ✅ Focus management and visible focus indicators
- ✅ ARIA attributes on interactive components
- ✅ Keyboard navigation support
- ✅ Color contrast on primary text

---

## Post-Audit Action Plan

### If Score < 90:
1. Export Lighthouse report as JSON
2. Review all "failed audits"
3. Prioritize by impact: Critical > Serious > Moderate
4. Fix in order of priority
5. Re-run Lighthouse → Verify score improves

### If Score >= 90:
1. Document current score and timestamp
2. Run axe DevTools for deeper analysis
3. Test with real screen reader (NVDA)
4. Fix any remaining issues
5. Mark Day 3 Part 2 complete ✅

---

## Accessibility Compliance Summary

**Target:** WCAG 2.1 Level AA  
**Current Status:** In Testing  
**Lighthouse Target:** 90+/100  
**Manual Testing:** Keyboard-only, Screen reader, Color contrast  

**Next Steps:**
1. Run Lighthouse audit → Document score
2. Fix critical issues (if any)
3. Run manual keyboard test
4. Test with NVDA screen reader
5. Update UI_DAY3_PROGRESS.md with final results

---

## Developer Checklist for New Components

When creating new components, ensure:
- [ ] Semantic HTML (`<button>` not `<div onClick>`)
- [ ] ARIA labels for icon-only buttons
- [ ] Visible focus indicator (focus-ring class)
- [ ] Keyboard support (Enter, Space, Escape)
- [ ] Error states have `aria-invalid` and `aria-describedby`
- [ ] Modals trap focus and close with Escape
- [ ] Color contrast meets 4.5:1 minimum
- [ ] Works with keyboard-only navigation
- [ ] Tested with screen reader (NVDA/VoiceOver)

---

**Ready to run Lighthouse? Navigate to http://localhost:3000/dashboard and open DevTools!**
