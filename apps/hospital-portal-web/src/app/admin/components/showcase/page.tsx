'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Save, Plus, Trash2, Download, Upload, Settings, User } from 'lucide-react'

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Breadcrumb items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Components', href: '/admin/components' },
            { label: 'UI Showcase' }
          ]} />
          <h1 className="text-4xl font-heading font-bold text-primary-800 mt-4">
            UI Components Showcase
          </h1>
          <p className="text-gray-600 mt-2">
            Emerald green theme with Tailwind CSS v4, Google Fonts, and enhanced components
          </p>
        </div>

        {/* Buttons Section */}
        <Card hover>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button styles and sizes with emerald theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="success">Success Button</Button>
                <Button variant="outline">Outline Button</Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">With Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" leftIcon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
                <Button variant="secondary" leftIcon={<Plus className="h-4 w-4" />}>
                  Add Patient
                </Button>
                <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />}>
                  Delete
                </Button>
                <Button variant="ghost" rightIcon={<Download className="h-4 w-4" />}>
                  Export
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading>
                  Loading...
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Section */}
        <Card hover accent>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Inputs with labels, validation, and emerald focus rings</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Patient Name"
                  placeholder="Enter patient name"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="patient@example.com"
                  helperText="We'll never share your email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  required
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  required
                />
              </div>

              <div>
                <Input
                  label="Invalid Input Example"
                  placeholder="This shows error state"
                  error="This field contains an error"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label required>Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                      <SelectItem value="optometry">Optometry</SelectItem>
                      <SelectItem value="optical">Optical Shop</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" type="submit" leftIcon={<Save className="h-4 w-4" />}>
                  Save Patient
                </Button>
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Data Table</CardTitle>
            <CardDescription>Sticky headers, zebra striping, and hover states</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader sticky>
                <TableRow>
                  <TableHead sortable>Patient Name</TableHead>
                  <TableHead sortable>MRN</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: 'Dr. Rajesh Kumar', mrn: 'MRN-001', dept: 'Ophthalmology', date: '2026-01-26', status: 'Active' },
                  { name: 'Ms. Priya Sharma', mrn: 'MRN-002', dept: 'Optometry', date: '2026-01-26', status: 'Active' },
                  { name: 'Mr. Amit Patel', mrn: 'MRN-003', dept: 'Optical Shop', date: '2026-01-27', status: 'Pending' },
                  { name: 'Mrs. Sunita Reddy', mrn: 'MRN-004', dept: 'Imaging', date: '2026-01-27', status: 'Active' },
                  { name: 'Mr. Vikram Singh', mrn: 'MRN-005', dept: 'Ophthalmology', date: '2026-01-28', status: 'Active' },
                ].map((patient, index) => (
                  <TableRow key={index} zebra>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.mrn}</TableCell>
                    <TableCell>{patient.dept}</TableCell>
                    <TableCell>{patient.date}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        patient.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {patient.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Section */}
        <Card>
          <CardHeader>
            <CardTitle>Dialogs</CardTitle>
            <CardDescription>Modal dialogs with different sizes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="primary">Open Small Dialog</Button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>Small Dialog</DialogTitle>
                    <DialogDescription>
                      This is a small dialog example with emerald theme.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-600">
                      Dialog content goes here. This demonstrates the emerald green focus rings and hover states.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button variant="primary">Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open Medium Dialog</Button>
                </DialogTrigger>
                <DialogContent size="md">
                  <DialogHeader>
                    <DialogTitle>Medium Dialog</DialogTitle>
                    <DialogDescription>
                      This is a medium-sized dialog with a form.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input label="Patient Name" placeholder="Enter name" required />
                    <Input label="Email" type="email" placeholder="patient@example.com" />
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button variant="primary" leftIcon={<Save className="h-4 w-4" />}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Large Dialog</Button>
                </DialogTrigger>
                <DialogContent size="lg">
                  <DialogHeader>
                    <DialogTitle>Large Dialog</DialogTitle>
                    <DialogDescription>
                      This is a large dialog for complex forms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="First Name" placeholder="John" required />
                      <Input label="Last Name" placeholder="Doe" required />
                    </div>
                    <Input label="Email" type="email" placeholder="john.doe@example.com" />
                    <div>
                      <Label required>Department</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                          <SelectItem value="optometry">Optometry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">Cancel</Button>
                    <Button variant="primary">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Section */}
        <Card>
          <CardHeader>
            <CardTitle>Emerald Color Palette</CardTitle>
            <CardDescription>Primary emerald green shades and status colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Primary (Emerald Green)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary-50 border border-gray-200"></div>
                    <p className="text-xs text-gray-600">primary-50</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary-100 border border-gray-200"></div>
                    <p className="text-xs text-gray-600">primary-100</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary-500"></div>
                    <p className="text-xs text-gray-600 font-semibold">primary-500 (Main)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary-600"></div>
                    <p className="text-xs text-gray-600">primary-600</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary-700"></div>
                    <p className="text-xs text-gray-600">primary-700</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-primary-800"></div>
                    <p className="text-xs text-gray-600">primary-800</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Status Colors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-status-critical"></div>
                    <p className="text-xs text-gray-600">Critical (Red)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-status-warning"></div>
                    <p className="text-xs text-gray-600">Warning (Amber)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-status-info"></div>
                    <p className="text-xs text-gray-600">Info (Blue)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-16 rounded-lg bg-status-success"></div>
                    <p className="text-xs text-gray-600">Success (Emerald)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Google Fonts: Inter, Plus Jakarta Sans, IBM Plex Mono</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Headings (Plus Jakarta Sans)</p>
              <h1 className="text-4xl font-heading font-bold text-primary-800">Heading 1</h1>
              <h2 className="text-3xl font-heading font-bold text-primary-800">Heading 2</h2>
              <h3 className="text-2xl font-heading font-semibold text-primary-800">Heading 3</h3>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Body Text (Inter)</p>
              <p className="text-base text-gray-900">
                This is body text using Inter font. It's optimized for readability and used for all UI elements, forms, and tables. Inter is a sans-serif typeface designed for computer screens.
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Monospace (IBM Plex Mono)</p>
              <p className="text-sm font-mono text-gray-800 bg-gray-100 p-3 rounded">
                MRN-12345 | Visual Acuity: 20/20 | IOP: 15 mmHg | Prescription: -2.50 -1.00 × 180
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
