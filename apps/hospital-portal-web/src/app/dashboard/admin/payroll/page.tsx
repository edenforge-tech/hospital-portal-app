'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react'

export default function PayrollPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Admin', href: '/dashboard/admin' },
          { label: 'Payroll' }
        ]} />

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Payroll Management</h1>
          <p className="text-gray-600 mt-2">Manage employee salaries, bonuses, and payment processing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover accent>
            <CardHeader>
              <CardTitle className="text-sm">Total Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-primary-800">₹45.2L</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <DollarSign className="h-10 w-10 text-primary-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-sm">Employees Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-status-success">142/165</p>
                  <p className="text-xs text-gray-500 mt-1">Processed</p>
                </div>
                <Users className="h-10 w-10 text-status-success opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-sm">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-status-warning">23</p>
                  <p className="text-xs text-gray-500 mt-1">To be processed</p>
                </div>
                <Calendar className="h-10 w-10 text-status-warning opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle className="text-sm">Avg Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-heading font-bold text-status-info">₹27,394</p>
                  <p className="text-xs text-status-success mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +5.2% vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search employees..."
                className="md:w-64"
              />
              <Select>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jan-2026">January 2026</SelectItem>
                  <SelectItem value="dec-2025">December 2025</SelectItem>
                  <SelectItem value="nov-2025">November 2025</SelectItem>
                  <SelectItem value="oct-2025">October 2025</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="optometry">Optometry</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="nursing">Nursing</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                  Export Payroll
                </Button>
                <Button variant="primary">
                  Process Payroll
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Details - January 2026</CardTitle>
            <CardDescription>Employee salary breakdown and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead sortable>Employee ID</TableHead>
                  <TableHead sortable>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: 'EMP001', name: 'Dr. Rajesh Kumar', dept: 'Ophthalmology', basic: '₹85,000', allowances: '₹15,000', deductions: '₹8,500', net: '₹91,500', status: 'Paid' },
                  { id: 'EMP002', name: 'Ms. Priya Sharma', dept: 'Optometry', basic: '₹55,000', allowances: '₹10,000', deductions: '₹5,500', net: '₹59,500', status: 'Paid' },
                  { id: 'EMP003', name: 'Mr. Amit Patel', dept: 'Administration', basic: '₹35,000', allowances: '₹5,000', deductions: '₹3,500', net: '₹36,500', status: 'Pending' },
                  { id: 'EMP004', name: 'Mrs. Sunita Reddy', dept: 'Nursing', basic: '₹42,000', allowances: '₹8,000', deductions: '₹4,200', net: '₹45,800', status: 'Paid' },
                  { id: 'EMP005', name: 'Mr. Vikram Singh', dept: 'Ophthalmology', basic: '₹78,000', allowances: '₹12,000', deductions: '₹7,800', net: '₹82,200', status: 'Processing' },
                  { id: 'EMP006', name: 'Dr. Anjali Desai', dept: 'Optometry', basic: '₹72,000', allowances: '₹13,000', deductions: '₹7,200', net: '₹77,800', status: 'Paid' },
                  { id: 'EMP007', name: 'Mr. Karan Mehta', dept: 'Administration', basic: '₹48,000', allowances: '₹7,000', deductions: '₹4,800', net: '₹50,200', status: 'Pending' },
                ].map((payroll, index) => (
                  <TableRow key={index} zebra>
                    <TableCell className="font-mono text-sm">{payroll.id}</TableCell>
                    <TableCell className="font-medium">{payroll.name}</TableCell>
                    <TableCell>{payroll.dept}</TableCell>
                    <TableCell className="font-mono text-sm">{payroll.basic}</TableCell>
                    <TableCell className="font-mono text-sm text-status-success">{payroll.allowances}</TableCell>
                    <TableCell className="font-mono text-sm text-status-critical">{payroll.deductions}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold">{payroll.net}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payroll.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : payroll.status === 'Processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payroll.status}
                      </span>
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
