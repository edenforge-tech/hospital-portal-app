'use client';

import { useEffect, useState } from 'react';
import { Globe, MapPin, Plus, Edit2, Trash2, Save, X, AlertCircle, CheckCircle } from 'lucide-react';

interface ScopeRule {
  id: string;
  ruleName: string;
  region: string;
  state?: string;
  country: string;
  departmentCodes: string[];
  allowedQualifications: string[];
  restrictedProcedures: string[];
  requiredCertifications: string[];
  minimumExperience?: number; // years
  ageRestrictions?: {
    minimumAge?: number;
    maximumAge?: number;
  };
  geographicRestrictions: string[];
  complianceFramework: string; // e.g., "NABH", "JCI", "State Medical Council"
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
}

const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana',
  'Maharashtra', 'Gujarat', 'Delhi', 'West Bengal', 'Punjab'
];

const QUALIFICATIONS = [
  'MBBS', 'MD', 'MS', 'DNB', 'DM', 'MCh',
  'BDS', 'MDS', 'BAMS', 'BHMS', 'B.Sc Nursing',
  'Diploma in Nursing', 'Paramedic Certification'
];

const CERTIFICATIONS = [
  'BLS (Basic Life Support)',
  'ACLS (Advanced Cardiac Life Support)',
  'PALS (Pediatric Advanced Life Support)',
  'ATLS (Advanced Trauma Life Support)',
  'NRP (Neonatal Resuscitation Program)',
  'State Medical Council Registration',
  'National Board Certification',
  'Specialty Board Certification'
];

const COMPLIANCE_FRAMEWORKS = [
  'NABH (National Accreditation Board for Hospitals)',
  'JCI (Joint Commission International)',
  'State Medical Council',
  'Medical Council of India',
  'Indian Medical Association',
  'ISO 9001:2015'
];

export default function ScopePracticeValidationPage() {
  const [rules, setRules] = useState<ScopeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRule, setEditingRule] = useState<ScopeRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock data - replace with actual API call
      const mockRules: ScopeRule[] = [
        {
          id: 'rule-1',
          ruleName: 'Karnataka Junior Doctor - OT Access',
          region: 'South India',
          state: 'Karnataka',
          country: 'India',
          departmentCodes: ['STD_JUNIOR_DOCTOR', 'STD_OT'],
          allowedQualifications: ['MBBS', 'MD'],
          restrictedProcedures: ['Major surgeries without supervision', 'Invasive cardiac procedures'],
          requiredCertifications: ['BLS', 'ACLS', 'State Medical Council Registration'],
          minimumExperience: 1,
          ageRestrictions: {
            minimumAge: 23,
          },
          geographicRestrictions: ['Must practice within Karnataka state'],
          complianceFramework: 'NABH (National Accreditation Board for Hospitals)',
          isActive: true,
          effectiveDate: '2025-01-01',
        },
        {
          id: 'rule-2',
          ruleName: 'Tamil Nadu - ICU Access',
          region: 'South India',
          state: 'Tamil Nadu',
          country: 'India',
          departmentCodes: ['STD_ICU', 'STD_EMERGENCY'],
          allowedQualifications: ['MBBS', 'MD', 'DNB'],
          restrictedProcedures: [],
          requiredCertifications: ['ACLS', 'State Medical Council Registration'],
          minimumExperience: 2,
          geographicRestrictions: ['Practice limited to Tamil Nadu'],
          complianceFramework: 'State Medical Council',
          isActive: true,
          effectiveDate: '2025-01-01',
        },
      ];
      setRules(mockRules);
    } catch (err: any) {
      setError('Failed to load scope of practice rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingRule({
      id: '',
      ruleName: '',
      region: '',
      country: 'India',
      departmentCodes: [],
      allowedQualifications: [],
      restrictedProcedures: [],
      requiredCertifications: [],
      geographicRestrictions: [],
      complianceFramework: '',
      isActive: true,
      effectiveDate: new Date().toISOString().split('T')[0],
    });
    setIsCreating(true);
  };

  const handleEdit = (rule: ScopeRule) => {
    setEditingRule({ ...rule });
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!editingRule) return;

    if (!editingRule.ruleName || !editingRule.country) {
      setError('Rule name and country are required');
      return;
    }

    setError('');
    setSuccess('');
    try {
      if (isCreating) {
        setRules([...rules, { ...editingRule, id: `rule-${Date.now()}` }]);
        setSuccess('Scope of practice rule created successfully');
      } else {
        setRules(rules.map(r => r.id === editingRule.id ? editingRule : r));
        setSuccess('Scope of practice rule updated successfully');
      }
      setEditingRule(null);
      setIsCreating(false);
    } catch (err: any) {
      setError('Failed to save scope of practice rule');
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Delete this scope of practice rule?')) return;

    try {
      setRules(rules.filter(r => r.id !== ruleId));
      setSuccess('Scope of practice rule deleted successfully');
    } catch (err: any) {
      setError('Failed to delete rule');
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Globe className="h-8 w-8 text-indigo-600" />
              Scope of Practice Validation
            </h1>
            <p className="text-gray-600 mt-2">
              Configure region-specific access rules and qualification requirements
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5" />
            Add Rule
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* Rules List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading rules...</div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  !rule.isActive ? 'opacity-60 border-gray-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{rule.ruleName}</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={() => toggleRuleStatus(rule.id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-600">Active</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Region</p>
                          <p className="font-medium text-gray-900">{rule.region || 'Global'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Country</p>
                        <p className="font-medium text-gray-900">{rule.country}</p>
                      </div>
                      {rule.state && (
                        <div>
                          <p className="text-sm text-gray-600">State</p>
                          <p className="font-medium text-gray-900">{rule.state}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Effective Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(rule.effectiveDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {rule.allowedQualifications.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Allowed Qualifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.allowedQualifications.map(qual => (
                            <span key={qual} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.requiredCertifications.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Required Certifications:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.requiredCertifications.map(cert => (
                            <span key={cert} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.restrictedProcedures.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Restricted Procedures:</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.restrictedProcedures.map(proc => (
                            <span key={proc} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {proc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      <strong>Compliance Framework:</strong> {rule.complianceFramework}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Edit Rule"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingRule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isCreating ? 'Create Scope Rule' : 'Edit Scope Rule'}
                  </h2>
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setIsCreating(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={editingRule.ruleName}
                      onChange={(e) => setEditingRule({ ...editingRule, ruleName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Karnataka Junior Doctor - OT Access"
                    />
                  </div>

                  {/* Geographic Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Scope</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                        <select
                          value={editingRule.country}
                          onChange={(e) => setEditingRule({ ...editingRule, country: e.target.value, state: undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          {COUNTRIES.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      {editingRule.country === 'India' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <select
                            value={editingRule.state || ''}
                            onChange={(e) => setEditingRule({ ...editingRule, state: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select State</option>
                            {INDIAN_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                        <input
                          type="text"
                          value={editingRule.region}
                          onChange={(e) => setEditingRule({ ...editingRule, region: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g., South India"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Qualifications</h3>
                    <div className="space-y-2">
                      {QUALIFICATIONS.map(qual => (
                        <label key={qual} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.allowedQualifications.includes(qual)}
                            onChange={(e) => {
                              const newQuals = e.target.checked
                                ? [...editingRule.allowedQualifications, qual]
                                : editingRule.allowedQualifications.filter(q => q !== qual);
                              setEditingRule({ ...editingRule, allowedQualifications: newQuals });
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{qual}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Certifications</h3>
                    <div className="space-y-2">
                      {CERTIFICATIONS.map(cert => (
                        <label key={cert} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.requiredCertifications.includes(cert)}
                            onChange={(e) => {
                              const newCerts = e.target.checked
                                ? [...editingRule.requiredCertifications, cert]
                                : editingRule.requiredCertifications.filter(c => c !== cert);
                              setEditingRule({ ...editingRule, requiredCertifications: newCerts });
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{cert}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience & Age */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience & Age Restrictions</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Experience (Years)
                        </label>
                        <input
                          type="number"
                          value={editingRule.minimumExperience || ''}
                          onChange={(e) => setEditingRule({ ...editingRule, minimumExperience: parseInt(e.target.value) || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Age
                        </label>
                        <input
                          type="number"
                          value={editingRule.ageRestrictions?.minimumAge || ''}
                          onChange={(e) => setEditingRule({ 
                            ...editingRule, 
                            ageRestrictions: { ...editingRule.ageRestrictions, minimumAge: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="18"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Age
                        </label>
                        <input
                          type="number"
                          value={editingRule.ageRestrictions?.maximumAge || ''}
                          onChange={(e) => setEditingRule({ 
                            ...editingRule, 
                            ageRestrictions: { ...editingRule.ageRestrictions, maximumAge: parseInt(e.target.value) || undefined }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="70"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compliance Framework */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compliance Framework *
                    </label>
                    <select
                      value={editingRule.complianceFramework}
                      onChange={(e) => setEditingRule({ ...editingRule, complianceFramework: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Framework</option>
                      {COMPLIANCE_FRAMEWORKS.map(framework => (
                        <option key={framework} value={framework}>{framework}</option>
                      ))}
                    </select>
                  </div>

                  {/* Effective Dates */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Effective Date *
                        </label>
                        <input
                          type="date"
                          value={editingRule.effectiveDate}
                          onChange={(e) => setEditingRule({ ...editingRule, effectiveDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={editingRule.expiryDate || ''}
                          onChange={(e) => setEditingRule({ ...editingRule, expiryDate: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setIsCreating(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="h-5 w-5" />
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
