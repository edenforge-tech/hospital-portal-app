// Features Settings Tab Component
// Comprehensive feature flags and capabilities management

'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  ToggleLeft, 
  ToggleRight, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Shield, 
  Smartphone, 
  Activity, 
  CreditCard, 
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { TenantSettings, FeatureFlag } from '../../lib/api/system-settings.api';

interface FeaturesSettingsTabProps {
  settings: TenantSettings;
  featureFlags: FeatureFlag[];
  updateSettings: (path: string, value: any) => void;
  toggleFeature: (featureName: string, enabled: boolean) => void;
}

interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: FeatureDefinition[];
}

interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  icon?: any;
  dependencies?: string[];
  premium?: boolean;
  beta?: boolean;
  impact: 'Low' | 'Medium' | 'High';
}

const featureCategories: FeatureCategory[] = [
  {
    id: 'patient-care',
    name: 'Patient Care',
    description: 'Core patient management and care features',
    icon: Users,
    features: [
      {
        key: 'patientPortal',
        name: 'Patient Portal',
        description: 'Enable patients to access their records, book appointments, and communicate with providers',
        icon: Users,
        impact: 'High'
      },
      {
        key: 'telehealth',
        name: 'Telehealth',
        description: 'Video consultations and remote patient care capabilities',
        icon: Smartphone,
        impact: 'High',
        premium: true
      },
      {
        key: 'patientSurveys',
        name: 'Patient Surveys',
        description: 'Automated patient satisfaction and outcome surveys',
        icon: MessageSquare,
        impact: 'Medium'
      },
      {
        key: 'patientCommunication',
        name: 'Patient Communication',
        description: 'SMS, email, and secure messaging with patients',
        icon: MessageSquare,
        impact: 'High'
      }
    ]
  },
  {
    id: 'scheduling',
    name: 'Scheduling & Operations',
    description: 'Appointment and operational management features',
    icon: Calendar,
    features: [
      {
        key: 'appointmentReminders',
        name: 'Appointment Reminders',
        description: 'Automated SMS and email reminders for upcoming appointments',
        icon: Calendar,
        impact: 'Medium'
      },
      {
        key: 'multiLocation',
        name: 'Multi-Location Support',
        description: 'Manage appointments and resources across multiple locations',
        icon: Activity,
        impact: 'High',
        premium: true
      },
      {
        key: 'workflowAutomation',
        name: 'Workflow Automation',
        description: 'Automated workflows for common tasks and processes',
        icon: Zap,
        impact: 'High',
        beta: true
      }
    ]
  },
  {
    id: 'documentation',
    name: 'Documentation & Records',
    description: 'Document management and medical records features',
    icon: FileText,
    features: [
      {
        key: 'documentSharing',
        name: 'Document Sharing',
        description: 'Secure document sharing between providers and patients',
        icon: FileText,
        impact: 'Medium'
      },
      {
        key: 'customFields',
        name: 'Custom Fields',
        description: 'Add custom fields to patient records and forms',
        icon: FileText,
        impact: 'Medium'
      },
      {
        key: 'electronicPrescribing',
        name: 'Electronic Prescribing',
        description: 'Electronic prescription management and pharmacy integration',
        icon: FileText,
        impact: 'High',
        premium: true
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Third-party integrations and connectivity',
    icon: Shield,
    features: [
      {
        key: 'billingIntegration',
        name: 'Billing Integration',
        description: 'Integration with billing and accounting systems',
        icon: CreditCard,
        impact: 'High',
        premium: true
      },
      {
        key: 'labIntegration',
        name: 'Lab Integration',
        description: 'Integration with laboratory systems for automated results',
        icon: Activity,
        impact: 'Medium',
        premium: true
      },
      {
        key: 'pharmacyIntegration',
        name: 'Pharmacy Integration',
        description: 'Integration with pharmacy systems for prescription management',
        icon: Shield,
        impact: 'Medium',
        premium: true
      },
      {
        key: 'insuranceVerification',
        name: 'Insurance Verification',
        description: 'Automated insurance eligibility verification',
        icon: Shield,
        impact: 'Medium',
        premium: true
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Reporting',
    description: 'Advanced analytics and reporting capabilities',
    icon: Activity,
    features: [
      {
        key: 'advancedReporting',
        name: 'Advanced Reporting',
        description: 'Custom reports and advanced analytics dashboard',
        icon: Activity,
        impact: 'Medium',
        premium: true
      },
      {
        key: 'auditLogs',
        name: 'Audit Logs',
        description: 'Comprehensive audit logging and compliance tracking',
        icon: Shield,
        impact: 'High'
      },
      {
        key: 'bulkOperations',
        name: 'Bulk Operations',
        description: 'Import/export and batch processing capabilities',
        icon: Zap,
        impact: 'Medium'
      }
    ]
  },
  {
    id: 'platform',
    name: 'Platform & Access',
    description: 'Platform-level features and access controls',
    icon: Shield,
    features: [
      {
        key: 'mobileApp',
        name: 'Mobile App',
        description: 'Native mobile application for providers and patients',
        icon: Smartphone,
        impact: 'High',
        premium: true,
        beta: true
      },
      {
        key: 'apiAccess',
        name: 'API Access',
        description: 'RESTful API access for custom integrations',
        icon: Shield,
        impact: 'Medium',
        premium: true
      },
      {
        key: 'singleSignOn',
        name: 'Single Sign-On',
        description: 'SSO integration with enterprise identity providers',
        icon: Shield,
        impact: 'Medium',
        premium: true
      }
    ]
  }
];

export default function FeaturesSettingsTab({ 
  settings, 
  featureFlags, 
  updateSettings, 
  toggleFeature 
}: FeaturesSettingsTabProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['patient-care']));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getFeatureStatus = (featureKey: string): boolean => {
    // Check both settings.features and featureFlags
    const settingValue = (settings.features as any)[featureKey];
    const flagValue = featureFlags.find(f => f.featureName === featureKey)?.isEnabled;
    return settingValue ?? flagValue ?? false;
  };

  const getDependencyStatus = (dependencies: string[] = []): { met: boolean; missing: string[] } => {
    const missing = dependencies.filter(dep => !getFeatureStatus(dep));
    return { met: missing.length === 0, missing };
  };

  const filteredCategories = featureCategories.map(category => ({
    ...category,
    features: category.features.filter(feature =>
      feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.features.length > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Feature Management</h3>
            <p className="text-sm text-gray-600">Enable or disable features and capabilities</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Feature Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const IconComponent = category.icon;
          const isExpanded = expandedCategories.has(category.id);
          
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-500">
                    {category.features.filter(f => getFeatureStatus(f.key)).length} / {category.features.length} enabled
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="p-4 space-y-4">
                    {category.features.map((feature) => {
                      const isEnabled = getFeatureStatus(feature.key);
                      const dependencyStatus = getDependencyStatus(feature.dependencies);
                      
                      return (
                        <div 
                          key={feature.key} 
                          className={`flex items-start justify-between p-4 border rounded-md ${
                            isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-gray-900">{feature.name}</h5>
                                
                                {feature.premium && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                                    Premium
                                  </span>
                                )}
                                
                                {feature.beta && (
                                  <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                                    Beta
                                  </span>
                                )}
                                
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  feature.impact === 'High' 
                                    ? 'bg-red-100 text-red-800'
                                    : feature.impact === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {feature.impact} Impact
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                            
                            {feature.dependencies && feature.dependencies.length > 0 && (
                              <div className={`text-sm ${dependencyStatus.met ? 'text-green-600' : 'text-orange-600'}`}>
                                <div className="flex items-center space-x-1">
                                  {dependencyStatus.met ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4" />
                                  )}
                                  <span>
                                    Dependencies: {feature.dependencies.join(', ')}
                                    {!dependencyStatus.met && ` (Missing: ${dependencyStatus.missing.join(', ')})`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-3 ml-4">
                            <button
                              onClick={() => {
                                const newValue = !isEnabled;
                                updateSettings(`features.${feature.key}`, newValue);
                                toggleFeature(feature.key, newValue);
                              }}
                              disabled={!dependencyStatus.met && !isEnabled}
                              className={`flex items-center p-1 rounded-full transition-colors ${
                                isEnabled 
                                  ? 'bg-green-500' 
                                  : dependencyStatus.met 
                                  ? 'bg-gray-300 hover:bg-gray-400' 
                                  : 'bg-gray-200 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              {isEnabled ? (
                                <ToggleRight className="h-6 w-6 text-white" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-gray-600" />
                              )}
                            </button>
                            
                            <div className={`text-sm font-medium ${
                              isEnabled ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <Info className="h-4 w-4 mr-2" />
          Feature Configuration Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-md p-3">
            <div className="text-2xl font-bold text-green-600">
              {Object.values(settings.features).filter(Boolean).length}
            </div>
            <div className="text-sm text-gray-600">Features Enabled</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className="text-2xl font-bold text-purple-600">
              {featureCategories.flatMap(c => c.features).filter(f => f.premium && getFeatureStatus(f.key)).length}
            </div>
            <div className="text-sm text-gray-600">Premium Features</div>
          </div>
          
          <div className="bg-white rounded-md p-3">
            <div className="text-2xl font-bold text-orange-600">
              {featureCategories.flatMap(c => c.features).filter(f => f.beta && getFeatureStatus(f.key)).length}
            </div>
            <div className="text-sm text-gray-600">Beta Features</div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-blue-700">
          <p>• Changes to features may require system restart</p>
          <p>• Premium features require an active subscription</p>
          <p>• Beta features are experimental and may change</p>
        </div>
      </div>
    </div>
  );
}