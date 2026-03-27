'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  BarChart3,
  TrendingUp,
  Users,
  Key,
  Download,
  Filter,
  Eye,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Role, Permission, RoleAnalytics } from '@/lib/api/roles-permissions-enhanced.api';

interface PermissionComplianceViewProps {
  roles: Role[];
  permissions: Permission[];
  analytics: RoleAnalytics | null;
}

export const PermissionComplianceView: React.FC<PermissionComplianceViewProps> = ({
  roles,
  permissions,
  analytics
}) => {
  const [selectedFramework, setSelectedFramework] = useState('HIPAA');
  const [complianceFilter, setComplianceFilter] = useState('all');

  // Mock compliance data
  const complianceFrameworks = [
    { id: 'HIPAA', name: 'HIPAA', score: 92, status: 'compliant' },
    { id: 'SOX', name: 'SOX', score: 85, status: 'compliant' },
    { id: 'GDPR', name: 'GDPR', score: 78, status: 'partial' },
    { id: 'PCI-DSS', name: 'PCI-DSS', score: 65, status: 'non-compliant' }
  ];

  const complianceViolations = [
    {
      id: '1',
      type: 'Permission Overlap',
      severity: 'High',
      description: 'Multiple roles have conflicting access permissions',
      affectedRoles: ['Admin', 'Manager'],
      lastChecked: '2024-01-15',
      status: 'open'
    },
    {
      id: '2',
      type: 'Excessive Permissions',
      severity: 'Medium',
      description: 'Role has more permissions than necessary',
      affectedRoles: ['Nurse Supervisor'],
      lastChecked: '2024-01-14',
      status: 'in-progress'
    },
    {
      id: '3',
      type: 'Audit Trail Gap',
      severity: 'Critical',
      description: 'Missing audit logs for sensitive operations',
      affectedRoles: ['Doctor', 'Pharmacy'],
      lastChecked: '2024-01-13',
      status: 'open'
    }
  ];

  const auditHistory = [
    { date: '2024-01', score: 88, violations: 12, resolved: 8 },
    { date: '2023-12', score: 85, violations: 15, resolved: 12 },
    { date: '2023-11', score: 82, violations: 18, resolved: 15 },
    { date: '2023-10', score: 79, violations: 22, resolved: 18 },
    { date: '2023-09', score: 76, violations: 25, resolved: 20 },
    { date: '2023-08', score: 74, violations: 28, resolved: 22 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance & Regulatory</h2>
          <p className="text-gray-600">
            Monitor regulatory compliance and audit requirements
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {complianceFrameworks.map(framework => (
                <SelectItem key={framework.id} value={framework.id}>
                  {framework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {complianceFrameworks.map((framework) => (
          <Card key={framework.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{framework.name}</h3>
                  <Badge className={getStatusColor(framework.status)}>
                    {framework.status.replace('-', ' ')}
                  </Badge>
                </div>
                <Shield className={`w-8 h-8 ${
                  framework.status === 'compliant' ? 'text-green-600' :
                  framework.status === 'partial' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Compliance Score</span>
                  <span className="font-bold text-2xl">{framework.score}%</span>
                </div>
                <Progress value={framework.score} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  Compliance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={auditHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Compliance Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Violations by Severity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                  Violations by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: 5, color: '#ef4444' },
                          { name: 'High', value: 12, color: '#f59e0b' },
                          { name: 'Medium', value: 23, color: '#eab308' },
                          { name: 'Low', value: 8, color: '#3b82f6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {[
                          { name: 'Critical', value: 5, color: '#ef4444' },
                          { name: 'High', value: 12, color: '#f59e0b' },
                          { name: 'Medium', value: 23, color: '#eab308' },
                          { name: 'Low', value: 8, color: '#3b82f6' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Compliance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                Role Compliance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roles.slice(0, 8).map((role) => {
                  // Mock compliance score for each role
                  const complianceScore = Math.floor(Math.random() * 40) + 60; // 60-100
                  const riskLevel = complianceScore > 90 ? 'Low' : 
                                   complianceScore > 75 ? 'Medium' : 'High';
                  
                  return (
                    <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{role.name}</h4>
                          <Badge className={getStatusColor(complianceScore > 85 ? 'compliant' : 'partial')}>
                            {complianceScore > 85 ? 'Compliant' : 'Needs Review'}
                          </Badge>
                          <Badge className={getSeverityColor(riskLevel)}>
                            {riskLevel} Risk
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{role.users.length} users</span>
                          <span>{role.permissions.length} permissions</span>
                          <span>Last audited: {Math.floor(Math.random() * 30) + 1} days ago</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Compliance Score</span>
                            <span className="text-sm font-medium">{complianceScore}%</span>
                          </div>
                          <Progress value={complianceScore} className="h-2" />
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  Compliance Violations
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceViolations.map((violation) => (
                  <div key={violation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{violation.type}</h4>
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                          <Badge className={getStatusColor(violation.status)}>
                            {violation.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{violation.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            Affected: {violation.affectedRoles.join(', ')}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {violation.lastChecked}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        {violation.status === 'open' && (
                          <Button size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit History Tab */}
        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                Audit History & Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={auditHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="violations" fill="#ef4444" name="Violations Found" />
                    <Bar dataKey="resolved" fill="#10b981" name="Violations Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2024-01-15', framework: 'HIPAA', score: 92, auditor: 'Internal Audit', duration: '3 days' },
                  { date: '2023-12-20', framework: 'SOX', score: 85, auditor: 'External Audit', duration: '5 days' },
                  { date: '2023-11-10', framework: 'GDPR', score: 78, auditor: 'Compliance Team', duration: '2 days' },
                  { date: '2023-10-05', framework: 'PCI-DSS', score: 65, auditor: 'Security Team', duration: '4 days' }
                ].map((audit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{audit.framework} Audit</h4>
                        <Badge className={getStatusColor(audit.score > 85 ? 'compliant' : 'partial')}>
                          Score: {audit.score}%
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>{audit.date}</span>
                        <span>{audit.auditor}</span>
                        <span>Duration: {audit.duration}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                Compliance Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    priority: 'High',
                    title: 'Implement Role Segregation',
                    description: 'Separate administrative and clinical roles to reduce permission overlap',
                    effort: 'Medium',
                    impact: 'High',
                    framework: 'HIPAA, SOX'
                  },
                  {
                    priority: 'Medium',
                    title: 'Enable Enhanced Auditing',
                    description: 'Add detailed audit trails for all sensitive operations',
                    effort: 'Low',
                    impact: 'High',
                    framework: 'HIPAA, GDPR'
                  },
                  {
                    priority: 'Medium',
                    title: 'Review Permission Templates',
                    description: 'Audit and update existing permission templates for compliance',
                    effort: 'Medium',
                    impact: 'Medium',
                    framework: 'All Frameworks'
                  },
                  {
                    priority: 'Low',
                    title: 'Automate Compliance Checks',
                    description: 'Set up automated compliance monitoring and reporting',
                    effort: 'High',
                    impact: 'Medium',
                    framework: 'SOX, PCI-DSS'
                  }
                ].map((recommendation, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge className={getSeverityColor(recommendation.priority)}>
                            {recommendation.priority} Priority
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.effort} Effort
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                        <div className="text-xs text-gray-500">
                          Applicable to: {recommendation.framework}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Implement
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionComplianceView;