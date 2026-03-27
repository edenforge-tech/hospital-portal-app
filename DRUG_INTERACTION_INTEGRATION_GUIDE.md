# Drug Interaction Integration Guide

## ✅ Task 5 Complete: Drug Interaction Database Seeded

### Database Status
- **41 drug interactions** successfully seeded
- **14 Critical severity** interactions (CONTRAINDICATED)
- **4 severity levels**: Critical, Serious, Moderate, Minor
- **Table**: `drug_interaction` (global table, no tenant_id)

### Sample Critical Interactions Seeded
1. **Timolol 0.5% + Asthma/COPD History** - Critical (bronchospasm risk)
2. **Acetazolamide + Sulfa Allergy** - Critical (Stevens-Johnson syndrome)
3. **Prednisolone Acetate 1% + Herpes Simplex Keratitis** - Critical (corneal perforation)
4. **Tropicamide 1% + Narrow Angles** - Critical (angle-closure glaucoma)
5. **Phenylephrine 2.5% + Uncontrolled Hypertension** - Critical (hypertensive crisis)
6. **Sildenafil + Nitrates** - Critical (cardiovascular collapse)

### API Endpoint

**POST** `/api/prescriptionvalidation/interactions`

#### Request
```json
[
  "Timolol 0.5%",
  "Latanoprost 0.005%",
  "Prednisolone Acetate 1%"
]
```

#### Response
```json
{
  "hasInteractions": true,
  "interactions": [
    {
      "id": "uuid",
      "drug1Name": "Timolol 0.5%",
      "drug2Name": "Asthma/COPD History",
      "interactionType": "Major",
      "severity": "Critical",
      "description": "Beta-blockers can cause bronchospasm in patients with reactive airway disease",
      "clinicalEffects": "Wheezing, shortness of breath, respiratory distress, potential respiratory failure",
      "mechanism": "Non-selective beta-blockade causes bronchoconstriction",
      "management": "CONTRAINDICATED. Use prostaglandin analog (Latanoprost) or alpha-agonist (Brimonidine) instead",
      "referenceSources": "FDA Black Box Warning, Established evidence"
    }
  ]
}
```

### Frontend Integration (MedicationsTab.tsx)

#### Step 1: Create API method
File: `apps/hospital-portal-web/src/lib/api/prescriptionValidation.api.ts`

```typescript
import { getApi } from './api';

export interface DrugInteraction {
  id: string;
  drug1Name: string;
  drug2Name: string;
  interactionType: 'Major' | 'Moderate' | 'Minor';
  severity: 'Critical' | 'Serious' | 'Moderate' | 'Minor';
  description: string;
  clinicalEffects?: string;
  mechanism?: string;
  management?: string;
  referenceSources?: string;
}

export interface DrugInteractionResult {
  hasInteractions: boolean;
  interactions: DrugInteraction[];
}

export const prescriptionValidationApi = {
  checkInteractions: async (medicationNames: string[]): Promise<DrugInteractionResult> => {
    const api = getApi();
    const response = await api.post<DrugInteractionResult>(
      '/prescriptionvalidation/interactions',
      medicationNames
    );
    return response.data;
  }
};
```

#### Step 2: Add interaction checking to MedicationsTab

```typescript
import { prescriptionValidationApi } from '@/lib/api/prescriptionValidation.api';

// In MedicationsTab component:
const [interactions, setInteractions] = useState<DrugInteraction[]>([]);

// Check interactions whenever medications change
useEffect(() => {
  const checkDrugInteractions = async () => {
    if (medications.length < 2) {
      setInteractions([]);
      return;
    }

    try {
      const medicationNames = medications.map(m => m.medicationName);
      const result = await prescriptionValidationApi.checkInteractions(medicationNames);
      setInteractions(result.interactions);
      
      // Show critical interactions immediately
      const criticalInteractions = result.interactions.filter(i => i.severity === 'Critical');
      if (criticalInteractions.length > 0) {
        toast.error(`${criticalInteractions.length} CRITICAL drug interactions detected!`);
      }
    } catch (error) {
      console.error('Failed to check drug interactions:', error);
    }
  };

  checkDrugInteractions();
}, [medications]);
```

#### Step 3: Display interaction warnings

```tsx
{/* Drug Interaction Warning Banner */}
{interactions.length > 0 && (
  <div className="mb-4 border border-red-600 rounded-lg p-4 bg-red-50">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <h3 className="font-semibold text-red-800">
        Drug Interactions Detected ({interactions.length})
      </h3>
    </div>
    
    <div className="space-y-2">
      {interactions.map((interaction, idx) => (
        <div key={idx} className={`p-3 rounded border ${
          interaction.severity === 'Critical' ? 'bg-red-100 border-red-300' :
          interaction.severity === 'Serious' ? 'bg-orange-100 border-orange-300' :
          interaction.severity === 'Moderate' ? 'bg-yellow-100 border-yellow-300' :
          'bg-blue-100 border-blue-300'
        }`}>
          <div className="flex justify-between items-start mb-1">
            <span className="font-medium">
              {interaction.drug1Name} + {interaction.drug2Name}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${
              interaction.severity === 'Critical' ? 'bg-red-600 text-white' :
              interaction.severity === 'Serious' ? 'bg-orange-600 text-white' :
              interaction.severity === 'Moderate' ? 'bg-yellow-600 text-white' :
              'bg-blue-600 text-white'
            }`}>
              {interaction.severity}
            </span>
          </div>
          <p className="text-sm mb-1">{interaction.description}</p>
          {interaction.management && (
            <p className="text-sm font-medium text-red-700 mt-2">
              ⚠️ {interaction.management}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}
```

### Database Verification

```sql
-- Check seeded interactions
SELECT COUNT(*) as total_interactions, 
       COUNT(DISTINCT severity) as severity_types,
       COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_count
FROM drug_interaction 
WHERE is_active = true;

-- Result:
-- total_interactions | severity_types | critical_count
-- 41                 | 4              | 14

-- Sample critical interactions
SELECT drug1_name, drug2_name, severity, LEFT(description, 60) as description
FROM drug_interaction 
WHERE severity = 'Critical' 
LIMIT 5;
```

### Testing Checklist

- [x] Database table created (`drug_interaction`)
- [x] 41 interactions seeded
- [x] DrugInteractionService exists
- [x] PrescriptionValidationController endpoint exists
- [x] Backend running and accessible
- [ ] Frontend API integration (prescriptionValidation.api.ts)
- [ ] MedicationsTab interaction checking
- [ ] Interaction warning UI display
- [ ] Manual testing with actual medications

### Important Notes

1. **Exact Name Matching**: The current implementation uses exact case-insensitive matching. Medications must match exactly:
   - ✅ "Timolol 0.5%" matches
   - ❌ "Timolol" alone won't match
   - **Future enhancement**: Implement fuzzy matching or "starts with" logic

2. **Severity Levels**:
   - **Critical**: Absolute contraindication (DO NOT PRESCRIBE)
   - **Serious**: High risk, requires careful monitoring
   - **Moderate**: Monitor closely, manageable
   - **Minor**: Inform patient, usually safe

3. **Bi-directional Checking**: The service checks both `(drug1, drug2)` and `(drug2, drug1)` combinations automatically.

4. **Global Table**: `drug_interaction` has no `tenant_id` - interactions are shared across all tenants.

## Next Steps

1. Create `prescriptionValidation.api.ts` file
2. Add interaction checking to MedicationsTab
3. Display warning UI when interactions detected
4. Test with sample medications:
   - Timolol 0.5% + Asthma/COPD History (Critical)
   - Latanoprost 0.005% + Bimatoprost 0.03% (Moderate)
   - Prednisolone Acetate 1% + Herpes Simplex Keratitis (Critical)

---
**✅ Task 5 Complete** - Drug interaction database successfully seeded with 41 interactions covering all major ophthalmology medication classes.
