# Convert patient/new page to NewPatientModal component
$sourcePath = "C:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web\src\app\dashboard\patients\new\page.tsx"
$targetPath = "C:\Users\Sam Aluri\Downloads\Hospital Portal\apps\hospital-portal-web\src\components\modals\NewPatientModal.tsx"

# Read the source file
$content = Get-Content $sourcePath -Raw

# 1. Add NewPatientModalProps interface at the top (after imports, before PatientFormData)
$content = $content -replace "import { X } from 'lucide-react';", @"
import { X } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}
"@

# 2. Change function signature from NewPatientPage() to NewPatientModal({ isOpen, onClose }: NewPatientModalProps)
$content = $content -replace "export default function NewPatientPage\(\)", "export default function NewPatientModal({ isOpen, onClose }: NewPatientModalProps)"

# 3. Remove the router and isInModal logic (lines 76-82 in original)
$content = $content -replace "(?s)const router = useRouter\(\);.*?}, \[\]\);", ""

# 4. Replace router.push with onClose in Cancel button and success
$content = $content -replace "onClick=\{\(\) => router\.push\('/dashboard/patients'\)\}", "onClick={onClose}"
$content = $content -replace "router\.push\(`/dashboard/patients/\$\{savedPatient\.id\}`\)", "onClose()"

# 5. Remove modal detection code
$content = $content -replace "if \(isInModal && window\.parent\).*?else \{", ""
$content = $content -replace "window\.parent\.postMessage.*?\}", ""

# 6. Wrap the main return in modal backdrop (find the main return statement)
$content = $content -replace 'return \(\s*<div className=\{isInModal \? "p-6" : "min-h-screen bg-gray-50 py-8"\}>', @'
if (!isOpen) return null;

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    // Modal Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          type="button"
        >
          <X size={24} />
        </button>

        {/* Form Container */}
        <div className="p-6">'@

# 7. Remove the page header section (the one that's conditionally shown when !isInModal)
$content = $content -replace '(?s)\{/\* Header - Only show when NOT in modal \*/\}.*?\{/\* Progress Indicator \*/\}', '{/* Progress Indicator */}'

# 8. Remove isInModal conditional  from progress indicator
$content = $content -replace '\{!isInModal && \(', '{'
$content = $content -replace 'className=\{isInModal \? "p-6" : "min-h-screen bg-gray-50 py-8"\}', 'className="p-6"'

# 9. Also remove isInModal check from step indicator in form
$content = $content -replace '(?s)\{/\* Show step indicator in modal \*/\}.*?\{isInModal.*?\}\)', ''

# 10. Close the extra divs at the end properly
$content = $content -replace '</div>\s*</div>\s*\);$', @'
      </div>
    </div>
  );
'@

# Save the converted file
Set-Content -Path $targetPath -Value $content

Write-Host "✅ Conversion complete! NewPatientModal.tsx created from patient/new page" -ForegroundColor Green
Write-Host "📝 All fields, validations, webcam, and registration card preview included" -ForegroundColor Cyan
