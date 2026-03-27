'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Activity,
  Target,
  Zap,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { RoleAnalytics, Role } from '@/lib/api/roles-permissions-enhanced.api';

interface RoleAnalyticsDashboardProps {
  analytics: RoleAnalytics;
  roles: Role[];
}

export const RoleAnalyticsDashboard: React.FC<RoleAnalyticsDashboardProps> = ({
  analytics,
  roles
}) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Chart colors
  const COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    teal: '#06b6d4'
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

  // Prepare data for charts
  const roleDistributionData = analytics.roleDistribution.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  const permissionUsageData = analytics.permissionUsage
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));

  const riskDistributionData = analytics.complianceMetrics.riskDistribution.map((item, index) => ({
    ...item,
    color: item.level === 'Critical' ? COLORS.danger :
           item.level === 'High' ? COLORS.warning :
           item.level === 'Medium' ? COLORS.secondary :
           COLORS.primary
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Analytics</h2>
          <p className="text-gray-600">
            Comprehensive insights into role usage, permissions, and compliance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.roleDistribution.reduce((sum, role) => sum + role.userCount, 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.roleDistribution.length} roles configured
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Permission Usage</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.permissionUsage.reduce((sum, perm) => sum + perm.usageCount, 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.permissionUsage.length} permissions tracked
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.complianceMetrics.overallScore}%
                </p>
                <div className="flex items-center mt-1">
                  {analytics.complianceMetrics.overallScore >= 90 ? (
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  ) : analytics.complianceMetrics.overallScore >= 70 ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>
                  )}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Violations</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.complianceMetrics.violationCount}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.complianceMetrics.auditCoverage}% audit coverage
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roles">Role Distribution</TabsTrigger>
          <TabsTrigger value="permissions">Permission Usage</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="userCount"
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                  Risk Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={riskDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Permissions Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 text-green-600 mr-2" />
                Most Used Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={permissionUsageData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="permissionName" type="category" width={150} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="usageCount" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Distribution Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role User Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.roleDistribution.map((role, index) => (
                    <div key={role.roleId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{role.roleName}</h4>
                        <p className="text-sm text-gray-600">{role.percentage}% of total users</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{role.userCount}</p>
                        <p className="text-xs text-gray-500">users</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.trends.roleGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke={COLORS.primary}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permission Usage Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.trends.permissionChanges}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="additions" 
                        stackId="1"
                        stroke={COLORS.secondary}
                        fill={COLORS.secondary}
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="removals" 
                        stackId="1"
                        stroke={COLORS.danger}
                        fill={COLORS.danger}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permission by Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Critical', 'High', 'Medium', 'Low'].map((risk) => {
                    const perms = analytics.permissionUsage.filter(p => p.riskLevel === risk);
                    const count = perms.length;
                    const usage = perms.reduce((sum, p) => sum + p.usageCount, 0);
                    
                    return (
                      <div key={risk} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            risk === 'Critical' ? 'bg-red-500' :
                            risk === 'High' ? 'bg-orange-500' :
                            risk === 'Medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium">{risk} Risk</h4>
                            <p className="text-sm text-gray-600">{count} permissions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{usage}</p>
                          <p className="text-xs text-gray-500">total uses</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {analytics.complianceMetrics.overallScore}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${analytics.complianceMetrics.overallScore}%` }}
                    ></div>
                  </div>
                  <Badge className={
                    analytics.complianceMetrics.overallScore >= 90 ? 'bg-green-100 text-green-800' :
                    analytics.complianceMetrics.overallScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {analytics.complianceMetrics.overallScore >= 90 ? 'Excellent' :
                     analytics.complianceMetrics.overallScore >= 70 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audit Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {analytics.complianceMetrics.auditCoverage}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${analytics.complianceMetrics.auditCoverage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">Roles audited</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {analytics.complianceMetrics.violationCount}
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    {analytics.complianceMetrics.violationCount === 0 ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Active violations</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count">
                      {riskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trends.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 text-purple-600 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recommendations.map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge className={
                          rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {rec.priority} Priority
                        </Badge>
                        <Badge variant="outline">{rec.effort} Effort</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-sm font-medium text-gray-900">Impact: {rec.impact}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoleAnalyticsDashboard;