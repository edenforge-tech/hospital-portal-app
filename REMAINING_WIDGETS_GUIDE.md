# Complete Implementation Guide - Remaining 7 Widgets

## ✅ Completed (8/15)

1. ✅ Post-Op Follow-Up Widget
2. ✅ Medication Schedule Widget
3. ✅ Education Library Widget
4. ✅ Appointment Reminder Widget
5. ✅ Vitals Monitoring Widget
6. ✅ Medical History Timeline Widget
7. ✅ Insurance Claim Tracking Widget
8. ✅ Smart Workflow Assistant Widget

---

## 🚧 Remaining Widgets (7/15) - Implementation Templates

###  **LabTestIntegrationWidget.tsx**

```typescript
'use client';
import React, { useState,useEffect } from 'react';
import { Flask, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - List of ordered lab tests with status badges
// - Click to view detailed results
// - Color-coded normal/abnormal values
// - PDF download for reports
// - Real-time status updates (ordered → sample-collected → processing → ready)

// UI PATTERN:
// - Top: Summary (X tests ordered, Y ready)
// - List of tests with status pills
// - Expandable sections for test results
// - Action: Order new test, Download report
```

### **ImagingViewerWidget.tsx**

```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { Image, Eye, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - List of imaging studies (OCT, Fundus, X-Ray, etc.)
// - Thumbnail grid view
// - Click to open DICOM viewer (can use Cornerstone.js)
// - Comparison mode (side-by-side)
// - Annotations and measurements
// - Export as image/PDF

// UI PATTERN:
// - Study list with modality badges
// - Thumbnail grid (2-3 columns)
// - Full-screen viewer button
// - Download and share options
```

### **BillingPaymentPlanWidget.tsx**

```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, DollarSign, Receipt } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - Total bill breakdown (line items)
// - Insurance coverage display
// - Balance due prominently shown
// - EMI calculator (select installments, see schedule)
// - Payment history table
// - Quick payment button
// - Invoice download

// UI PATTERN:
// - Top: Total amount, Paid, Balance (large numbers)
// - Section 1: Line items table
// - Section 2: Payment Plan creator
// - Section 3: Payment history
// - Action buttons: Pay Now, Create EMI Plan, Download Invoice
```

### **ReferralManagementWidget.tsx**

```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus, Send, CheckCircle2, Clock } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - List of outbound referrals with status
// - Create new referral form
// - Specialist finder (by specialty, location)
// - Attach medical records
// - Track referral status (pending → scheduled → completed)
// - Return referral notes

// UI PATTERN:
// - Active referrals list
// - Status timeline for each referral
// - Quick create referral button
// - Follow-up reminders
```

### **PatientFeedbackWidget.tsx**

```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, TrendingUp } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - Post-visit satisfaction survey
// - NPS score calculation (0-10 scale)
// - Category ratings (staff, facility, treatment, wait time)
// - Open comments section
// - Photo upload for complaints
// - Sentiment analysis badge
// - Anonymous option

// UI PATTERN:
// - Star rating component (1-5 stars)
// - Slider for NPS (0-10)
// - Category rating bars
// - Text area for comments
// - Submit button
// - Display previous feedback (feedback history)
```

### **TelemedicineConsultationWidget.tsx**

```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { Video, Mic, Phone, PhoneOff, Camera } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - Start video call button
// - Video feed (doctor + patient)
// - Screen sharing for document review
// - In-call chat
// - Session recording (with consent)
// - Call quality indicators
// - End call summary

// IMPLEMENTATION NOTE:
// - Use WebRTC (or integrate with Twilio/Agora/Zoom SDK)
// - For MVP: Just show call status UI and mock video
// - Full implementation requires video SDK setup

// UI PATTERN:
// - Large video preview area
// - Control bar (mic, camera, end call, screen share)
// - Side chat panel
// - Call duration timer
// - Post-call: Digital prescription button
```

### **TreatmentPlanComparisonWidget.tsx**

```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { GitCompare, TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { WidgetProps } from '@/lib/widgets/widget-types';
import { widgetsApi } from '@/lib/api/widgets.api';

// KEY FEATURES:
// - Side-by-side comparison table
// - Treatment options (e.g., Standard vs Premium cataract surgery)
// - Compare: Cost, Success rate, Recovery time, Risks, Benefits
// - Insurance coverage indicator
// - Recommended badge
// - Select treatment button
// - Print comparison chart

// UI PATTERN:
// - 2-3 column comparison table
// - Each row: Feature name, values for each plan
// - Top: Plan names with recommended badge
// - Bottom: Cost summary, Select plan button
// - Visual indicators (✓ for benefits, ⚠ for risks)
```

---

## Quick Creation Script

To speed up creation, use this pattern for each remaining widget:

```bash
# From apps/hospital-portal-web root
cd src/components/widgets

# For each widget, copy template:
# 1. Copy VitalsMonitoringWidget.tsx as base
# 2. Replace component name
# 3. Update API call
# 4. Customize UI sections
# 5. Update icons and colors
```

---

## Widget Registry Integration

After creating all widgets, add to `src/lib/widgets/widget-registry.ts`:

```typescript
// Import all new widgets
import PostOpFollowUpWidget from '@/components/widgets/PostOpFollowUpWidget';
import MedicationScheduleWidget from '@/components/widgets/MedicationScheduleWidget';
import EducationLibraryWidget from '@/components/widgets/EducationLibraryWidget';
import AppointmentReminderWidget from '@/components/widgets/AppointmentReminderWidget';
import VitalsMonitoringWidget from '@/components/widgets/VitalsMonitoringWidget';
import MedicalHistoryTimelineWidget from '@/components/widgets/MedicalHistoryTimelineWidget';
import LabTestIntegrationWidget from '@/components/widgets/LabTestIntegrationWidget';
import ImagingViewerWidget from '@/components/widgets/ImagingViewerWidget';
import InsuranceClaimTrackingWidget from '@/components/widgets/InsuranceClaimTrackingWidget';
import BillingPaymentPlanWidget from '@/components/widgets/BillingPaymentPlanWidget';
import ReferralManagementWidget from '@/components/widgets/ReferralManagementWidget';
import PatientFeedbackWidget from '@/components/widgets/PatientFeedbackWidget';
import TelemedicineConsultationWidget from '@/components/widgets/TelemedicineConsultationWidget';
import TreatmentPlanComparisonWidget from '@/components/widgets/TreatmentPlanComparisonWidget';
import SmartWorkflowAssistantWidget from '@/components/widgets/SmartWorkflowAssistantWidget';

// Register each widget
import { Activity, Pill, BookOpen, Calendar, Stethoscope, History, Flask, Image, FileCheck, CreditCard, UserPlus, MessageSquare, Video, GitCompare, Brain } from 'lucide-react';

// Post-Operative Care
WidgetRegistry.register({
  metadata: {
    id: 'post-op-follow-up',
    title: 'Post-Op Follow-Up',
    description: 'Track post-operative recovery milestones',
    icon: Activity,
    category: 'post-operative',
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full'],
    requiredStages: ['post-operative-care', 'follow-up-scheduling'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: PostOpFollowUpWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'medication-schedule',
    title: 'Medication Schedule',
    description: 'Daily medication schedule with adherence tracking',
    icon: Pill,
    category: 'post-operative',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    requiredStages: ['post-operative-care'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: MedicationScheduleWidget,
});

// Patient Education
WidgetRegistry.register({
  metadata: {
    id: 'education-library',
    title: 'Education Library',
    description: 'Patient education content library',
    icon: BookOpen,
    category: 'education',
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: EducationLibraryWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'appointment-reminder',
    title: 'Appointment Reminders',
    description: 'Upcoming appointment reminders',
    icon: Calendar,
    category: 'communication',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: AppointmentReminderWidget,
});

// Enhanced Clinical
WidgetRegistry.register({
  metadata: {
    id: 'vitals-monitoring',
    title: 'Vitals Monitoring',
    description: 'Record and track vital signs',
    icon: Stethoscope,
    category: 'monitoring',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    requiredStages: ['pre-surgery', 'admission'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: VitalsMonitoringWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'medical-history-timeline',
    title: 'Medical History Timeline',
    description: 'Visual chronological timeline of medical history',
    icon: History,
    category: 'monitoring',
    defaultSize: 'large',
    allowedSizes: ['large', 'full'],
    requiredStages: ['clinical-review', 'initial'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: MedicalHistoryTimelineWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'lab-test-integration',
    title: 'Lab Tests',
    description: 'Lab test orders and results',
    icon: Flask,
    category: 'monitoring',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: LabTestIntegrationWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'imaging-viewer',
    title: 'Medical Imaging',
    description: 'View and annotate medical images',
    icon: Image,
    category: 'imaging',
    defaultSize: 'large',
    allowedSizes: ['large', 'full'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: ImagingViewerWidget,
});

// Financial & Admin
WidgetRegistry.register({
  metadata: {
    id: 'insurance-claim-tracking',
    title: 'Insurance Claims',
    description: 'Track insurance claim status',
    icon: FileCheck,
    category: 'financial',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    requiredStages: ['financial'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: InsuranceClaimTrackingWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'billing-payment-plan',
    title: 'Billing & Payment',
    description: 'Billing statement and payment plans',
    icon: CreditCard,
    category: 'financial',
    defaultSize: 'large',
    allowedSizes: ['medium', 'large', 'full'],
    requiredStages: ['financial'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: BillingPaymentPlanWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'referral-management',
    title: 'Referrals',
    description: 'Manage outbound referrals',
    icon: UserPlus,
    category: 'admin',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: ReferralManagementWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'patient-feedback',
    title: 'Patient Feedback',
    description: 'Collect patient satisfaction feedback',
    icon: MessageSquare,
    category: 'admin',
    defaultSize: 'medium',
    allowedSizes: ['medium', 'large'],
    requiredStages: ['completed', 'followup'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: PatientFeedbackWidget,
});

// Advanced Features
WidgetRegistry.register({
  metadata: {
    id: 'telemedicine-consultation',
    title: 'Telemedicine',
    description: 'Video consultation interface',
    icon: Video,
    category: 'telemedicine',
    defaultSize: 'full',
    allowedSizes: ['large', 'full'],
    isPinnable: false,
    isCloseable: true,
    isResizable: false,
  },
  component: TelemedicineConsultationWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'treatment-plan-comparison',
    title: 'Treatment Comparison',
    description: 'Compare treatment options',
    icon: GitCompare,
    category: 'analytics',
    defaultSize: 'large',
    allowedSizes: ['large', 'full'],
    requiredStages: ['initial', 'package-selection'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: TreatmentPlanComparisonWidget,
});

WidgetRegistry.register({
  metadata: {
    id: 'smart-workflow-assistant',
    title: 'Workflow Assistant',
    description: 'AI-powered workflow suggestions',
    icon: Brain,
    category: 'analytics',
    defaultSize: 'medium',
    allowedSizes: ['small', 'medium', 'large'],
    isPinnable: true,
    isCloseable: true,
    isResizable: true,
  },
  component: SmartWorkflowAssistantWidget,
});
```

---

## Testing Plan

### 1. Unit Testing
```bash
# Test each widget component
npm run test -- --testPathPattern=widgets

# Test API integration
npm run test -- --testPathPattern=widgets.api
```

### 2. Integration Testing
- Load each widget in dashboard
- Verify API calls
- Check loading/error states
- Test responsive sizing
- Verify data display

### 3. E2E Testing
```typescript
// Cypress test
describe('New Widgets Integration', () => {
  it('should load all 15 new widgets', () => {
    cy.login('counselor');
    cy.addWidget('post-op-follow-up');
    cy.addWidget('medication-schedule');
    // ... test each widget
  });
});
```

---

## Performance Optimization (Next Phase)

After all widgets are created:
1. ✅ Lazy load widgets in registry2. ✅ Add React.memo to all widget exports
3. ✅ Implement React Query for API caching
4. ✅ Add virtual scrolling for list widgets
5. ✅ Optimize bundle size with code splitting

---

## Estimated Completion Time

- **Remaining 7 widgets**: 2-3 hours (if using templates efficiently)
- **Registry updates**: 30 minutes
- **Testing**: 1-2 hours
- **Fixes and refinement**: 1 hour
- **Total**: 4-7 hours

---

## Next Steps

1. Create remaining 7 widget files using templates above
2. Import and register all 15 widgets in registry
3. Run compilation check: `npm run build`
4. Test each widget in browser with mock data
5. Fix any TypeScript errors
6. Document each widget's features
7. Create demo video/screenshots

---

Would you like me to:
A) Generate all 7 remaining widget files now?
B) Focus on performance optimization first?
C) Create comprehensive testing suite?
D) Update documentation with screenshots?
