'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Download, TrendingUp, Award, Star, BarChart } from 'lucide-react'

export default function PerformancePage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Performance Reviews' }
        ]} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary-800">Performance Reviews</h1>
            <p className="text-gray-600 mt-2">Employee performance tracking and reviews</p>
          </div>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            New Review
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover accent>
            <CardHeader>
              <CardTitle className="text-sm">Avg Performance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-primary-800">8.4/10</p>
                  <p className="text-xs text-status-success mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +0.6 vs last quarter
                  </p>
                </div>
                <BarChart className="h-10 w-10 text-primary-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-sm">Reviews Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-status-success">124/165</p>
                  <p className="text-xs text-gray-500 mt-1">This quarter</p>
                </div>
                <Award className="h-10 w-10 text-status-success opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-sm">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-status-warning">41</p>
                  <p className="text-xs text-gray-500 mt-1">Due this month</p>
                </div>
                <Star className="h-10 w-10 text-status-warning opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-sm">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-status-info">23</p>
                  <p className="text-xs text-gray-500 mt-1">9+ rating</p>
                </div>
                <TrendingUp className="h-10 w-10 text-status-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search employees..."
                className="md:w-64"
              />
              <Select>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="optometry">Optometry</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="nursing">Nursing</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Review period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="q1-2026">Q1 2026</SelectItem>
                  <SelectItem value="q4-2025">Q4 2025</SelectItem>
                  <SelectItem value="q3-2025">Q3 2025</SelectItem>
                  <SelectItem value="q2-2025">Q2 2025</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} className="ml-auto">
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews - Q1 2026</CardTitle>
            <CardDescription>Employee performance ratings and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead sortable>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Review Date</TableHead>
                  <TableHead>Overall Score</TableHead>
                  <TableHead>Technical Skills</TableHead>
                  <TableHead>Communication</TableHead>
                  <TableHead>Teamwork</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Dr. Rajesh Kumar', dept: 'Ophthalmology', date: '2026-01-15', overall: 9.2, technical: 9.5, communication: 8.8, teamwork: 9.3, status: 'Completed' },
                  { name: 'Ms. Priya Sharma', dept: 'Optometry', date: '2026-01-18', overall: 8.7, technical: 8.5, communication: 9.0, teamwork: 8.5, status: 'Completed' },
                  { name: 'Mr. Amit Patel', dept: 'Administration', date: '2026-01-20', overall: 7.8, technical: 7.5, communication: 8.0, teamwork: 8.0, status: 'Completed' },
                  { name: 'Mrs. Sunita Reddy', dept: 'Nursing', date: '2026-01-22', overall: 8.9, technical: 9.0, communication: 8.7, teamwork: 9.0, status: 'Completed' },
                  { name: 'Mr. Vikram Singh', dept: 'Ophthalmology', date: '-', overall: '-', technical: '-', communication: '-', teamwork: '-', status: 'Pending' },
                  { name: 'Dr. Anjali Desai', dept: 'Optometry', date: '2026-01-25', overall: 9.5, technical: 9.8, communication: 9.2, teamwork: 9.5, status: 'Completed' },
                  { name: 'Mr. Karan Mehta', dept: 'Administration', date: '-', overall: '-', technical: '-', communication: '-', teamwork: '-', status: 'In Progress' },
                ].map((review, index) => (
                  <TableRow key={index} zebra>
                    <TableCell className="font-medium">{review.name}</TableCell>
                    <TableCell>{review.dept}</TableCell>
                    <TableCell className="font-mono text-sm">{review.date}</TableCell>
                    <TableCell>
                      {review.overall !== '-' ? (
                        <span className={`font-semibold ${
                          Number(review.overall) >= 9 
                            ? 'text-status-success' 
                            : Number(review.overall) >= 7
                            ? 'text-status-info'
                            : 'text-status-warning'
                        }`}>
                          {review.overall}/10
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{review.technical}</TableCell>
                    <TableCell className="font-mono text-sm">{review.communication}</TableCell>
                    <TableCell className="font-mono text-sm">{review.teamwork}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        review.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : review.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {review.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {review.status === 'Completed' ? (
                          <Button variant="ghost" size="sm">View</Button>
                        ) : (
                          <Button variant="primary" size="sm">Start Review</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
