'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCachedAuthStore } from '@/lib/permission-cache';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  Stethoscope,
  UserCircle,
  Pill,
  TestTube,
  Bell,
  FileText,
  Star,
  ArrowRightLeft,
  Ambulance,
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  Building,
  Building2,
  Briefcase,
  UserCheck,
  FileCheck,
  Smartphone,
  Key,
  AlertTriangle,
  ClipboardList,
  DollarSign,
  TrendingUp,
  GraduationCap,
  BarChart,
  FolderOpen,
  Upload,
  Activity,
  LogOut,
  LogIn,
  Menu,
  Eye,
  Glasses,
  Zap,
  Target,
  Layers,
  Droplet,
  Palette,
  Grid,
  Circle,
  ShoppingCart,
  Contact,
  Brain,
  Truck,
  Package,
  Thermometer,
  Wrench,
  Tent,
  CreditCard,
  Receipt,
  Camera,
  Video,
  Waves,
  UserPlus,
  Monitor,
  Siren,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredPermission: string | null;
  isSection?: boolean;
  isParent?: boolean;
  isChild?: boolean;
  isExpandable?: boolean;
  exact?: boolean;
  badge?: React.ReactNode;
  subItems?: MenuItem[];
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
  drawerOnly?: boolean;
}

export default function Sidebar({ isMobileOpen = false, onClose, drawerOnly = false }: SidebarProps) {
  const { roles, hasPermission, logout } = useCachedAuthStore();
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>('Dashboard');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedSubsections, setExpandedSubsections] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedPopover, setCollapsedPopover] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };

  const toggleSection = (sectionTitle: string) => {
    setOpenSection(prev => prev === sectionTitle ? null : sectionTitle);
  };

  const toggleSubmenu = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const toggleSubsection = (label: string) => {
    setExpandedSubsections(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // 40-Module Navigation Structure (10 Sections)
  const menuSections: MenuSection[] = [
    // SECTION 1: Dashboard (1 module)
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Overview',
          href: '/dashboard',
          icon: <LayoutDashboard className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        }
      ]
    },
    
    // SECTION 2: Clinical Modules (5 modules)
    {
      title: 'Clinical Modules',
      icon: <Stethoscope className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: "Doctor's Desk",
          href: '/dashboard/doctors-desk',
          icon: <Stethoscope className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'CLINICAL:EXAMINATION:VIEW'
        },
        {
          label: 'Optometrist Examination',
          href: '/dashboard/optometrist',
          icon: <Eye className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'CLINICAL:EXAMINATION:VIEW'
        },
        {
          label: 'Patient Directory',
          href: '/dashboard/patients',
          icon: <Users className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'patient.view'
        },
        {
          label: 'Junior Doctor',
          href: '/dashboard/examinations',
          icon: <UserCheck className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'clinical_examination.view'
        },
        {
          label: 'Advanced Services',
          href: '/dashboard/telemedicine',
          icon: <Star className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        }
      ]
    },

    // SECTION 3: Patient Care (8 modules)
    {
      title: 'Patient Care',
      icon: <Ambulance className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Front Office/OPD',
          href: '/dashboard/frontdesk',
          icon: <Contact className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        },
        {
          label: 'Queue Management',
          href: '/dashboard/frontdesk/queue',
          icon: <ClipboardList className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'queue_management.view'
        },
        {
          label: 'Counselor',
          href: '/dashboard/counselor',
          icon: <UserCircle className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        },
        {
          label: 'Counsellors Desk',
          href: '/dashboard/counsellors-desk/waiting-list',
          icon: <Stethoscope className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null,
          isExpandable: true,
          subItems: [
            {
              label: 'Counsellor Waiting List',
              href: '/dashboard/counsellors-desk/waiting-list',
              icon: <ClipboardList className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: null,
              isChild: true,
            },
            {
              label: 'Finalize Surgery',
              href: '/dashboard/counsellors-desk/finalize-surgery',
              icon: <FileCheck className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: null,
              isChild: true,
            },
            {
              label: 'Follow-up Center',
              href: '/dashboard/counsellors-desk/surgery-followup',
              icon: <PhoneCall className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: null,
              isChild: true,
            },
          ],
        },
        {
          label: 'IP Management',
          href: '/dashboard/ip-management/ward',
          icon: <Building2 className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null,
          isExpandable: true,
          subItems: [
            {
              label: 'Ward',
              href: '/dashboard/ip-management/ward',
              icon: <Tent className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: null,
              isChild: true,
            },
            {
              label: 'Operation Theatre',
              href: '/dashboard/ip-management/operation-theatre',
              icon: <Stethoscope className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: null,
              isChild: true,
            },
            {
              label: 'IP Management',
              href: '/dashboard/ip-management',
              icon: <CreditCard className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: null,
              isChild: true,
              exact: true,
            },
          ],
        },
        {
          label: 'Operation Theatre/Ward',
          href: '/dashboard/operations/ot',
          icon: <Activity className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:OT:VIEW'
        },
        {
          label: 'IPD Management',
          href: '/dashboard/operations/ot/schedule',
          icon: <Building2 className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:OT:VIEW'
        },
        {
          label: 'Bed Management',
          href: '/dashboard/operations/stores',
          icon: <Tent className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:STORES:VIEW'
        },
        {
          label: 'Discharge Management',
          href: '/dashboard/emergency',
          icon: <LogOut className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'emergency.view'
        },
        {
          label: 'Patient Portal',
          href: '/dashboard/patient-portal',
          icon: <Smartphone className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'patient_portal.view'
        }
      ]
    },

    // SECTION 4: Scheduling & Flow (3 modules)
    {
      title: 'Scheduling & Flow',
      icon: <Calendar className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Appointments',
          href: '/dashboard/appointments',
          icon: <Calendar className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'appointment.view'
        },
        {
          label: 'Staff Scheduling',
          href: '/dashboard/admin/hr',
          icon: <UserCheck className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'employee.view'
        },
        {
          label: 'Eye Camps',
          href: '/dashboard/operations/eye-camps',
          icon: <Tent className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:EYECAMP:VIEW'
        }
      ]
    },

    // SECTION 5: Diagnostics & Services (4 modules)
    {
      title: 'Diagnostics & Services',
      icon: <TestTube className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Scan/Imaging',
          href: '/dashboard/diagnostic/fundus-imaging',
          icon: <Camera className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'DIAGNOSTIC:IMAGING:VIEW'
        },
        {
          label: 'Diagnostics Lab',
          href: '/dashboard/diagnostic/biometry',
          icon: <TestTube className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'DIAGNOSTIC:BIOMETRY:VIEW'
        },
        {
          label: 'Laboratory (Pathology)',
          href: '/dashboard/laboratory',
          icon: <TestTube className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'laboratory.view'
        },
        {
          label: 'Blood Bank',
          href: '/dashboard/operations/ambulance',
          icon: <Droplet className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:AMBULANCE:VIEW'
        }
      ]
    },

    // SECTION 6: Pharmacy & Inventory (4 modules)
    {
      title: 'Pharmacy & Inventory',
      icon: <Pill className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Pharmacy',
          href: '/dashboard/pharmacy',
          icon: <Pill className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'pharmacy.view'
        },
        {
          label: 'Optical Shop',
          href: '/dashboard/optical',
          icon: <Glasses className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPTICAL:VIEW'
        },
        {
          label: 'Inventory Management',
          href: '/admin/inventory',
          icon: <Package className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:STORES:VIEW',
          isExpandable: true,
          subItems: [
            { label: 'Dashboard',        href: '/admin/inventory',               icon: <LayoutDashboard className="h-4 w-4" strokeWidth={2.5} />, isChild: true },
            { label: 'Vendors',          href: '/admin/inventory/vendors',       icon: <Truck className="h-4 w-4" strokeWidth={2.5} />,          isChild: true },
            { label: 'Invoices',         href: '/admin/inventory/invoices',      icon: <Receipt className="h-4 w-4" strokeWidth={2.5} />,        isChild: true },
            { label: 'GRN',              href: '/admin/inventory/grn',           icon: <Package className="h-4 w-4" strokeWidth={2.5} />,        isChild: true },
            { label: 'Purchase Query',   href: '/admin/inventory/purchase-query', icon: <ClipboardList className="h-4 w-4" strokeWidth={2.5} />,  isChild: true },
            { label: 'Stock',            href: '/admin/inventory/stock',         icon: <Layers className="h-4 w-4" strokeWidth={2.5} />,         isChild: true },
            { label: 'Transfers',        href: '/admin/inventory/transfers',     icon: <ArrowRightLeft className="h-4 w-4" strokeWidth={2.5} />, isChild: true },
            { label: 'Items',            href: '/admin/inventory/items',         icon: <Grid className="h-4 w-4" strokeWidth={2.5} />,           isChild: true },
            { label: 'Stores',           href: '/admin/inventory/stores',        icon: <Building className="h-4 w-4" strokeWidth={2.5} />,       isChild: true },
            { label: 'Pharmacy Bills',   href: '/admin/inventory/pharmacy',      icon: <Pill className="h-4 w-4" strokeWidth={2.5} />,           isChild: true },
            { label: 'Surgery OT',       href: '/admin/inventory/surgery',       icon: <Activity className="h-4 w-4" strokeWidth={2.5} />,       isChild: true },
            { label: 'Requisitions',     href: '/admin/inventory/requisitions',  icon: <ClipboardList className="h-4 w-4" strokeWidth={2.5} />,  isChild: true },
            { label: 'Purchase Returns', href: '/admin/inventory/returns',       icon: <RotateCcw className="h-4 w-4" strokeWidth={2.5} />,      isChild: true },
            { label: 'RFQ',              href: '/admin/inventory/rfq',           icon: <FileText className="h-4 w-4" strokeWidth={2.5} />,        isChild: true },
            { label: 'Purchase Orders',  href: '/admin/inventory/po',            icon: <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />,    isChild: true },
            { label: 'Procurement Policy', href: '/admin/inventory/procurement/policies', icon: <Shield className="h-4 w-4" strokeWidth={2.5} />, isChild: true },
            { label: 'Auto-Reorder',     href: '/admin/inventory/reorder',       icon: <Bell className="h-4 w-4" strokeWidth={2.5} />,           isChild: true },
            { label: 'Expiry Alerts',    href: '/admin/inventory/expiry',        icon: <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />,   isChild: true },
            { label: 'Vendor Performance', href: '/admin/inventory/vendor-performance', icon: <TrendingUp className="h-4 w-4" strokeWidth={2.5} />, isChild: true },
            { label: 'GST Reports',      href: '/admin/inventory/reports',       icon: <BarChart className="h-4 w-4" strokeWidth={2.5} />,       isChild: true },
          ]
        },
        {
          label: 'Asset Management',
          href: '/dashboard/operations/biomedical',
          icon: <Wrench className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:BIOMEDICAL:VIEW'
        }
      ]
    },

    // SECTION 7: Financial (3 modules)
    {
      title: 'Financial',
      icon: <DollarSign className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Billing & Finance',
          href: '/dashboard/billing/opd',
          icon: <DollarSign className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        },
        {
          label: 'Insurance Management',
          href: '/dashboard/finance?tab=insurance',
          icon: <Shield className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'FINANCE:INSURANCE:VIEW'
        },
        {
          label: 'Revenue Cycle',
          href: '/dashboard/finance?tab=reports',
          icon: <TrendingUp className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'FINANCE:REPORTS:VIEW'
        }
      ]
    },

    // SECTION 8: Compliance & Quality (6 modules)
    {
      title: 'Compliance & Quality',
      icon: <Shield className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Consent Management',
          href: '/dashboard/quality',
          icon: <FileCheck className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'quality.view'
        },
        {
          label: 'NABH Management',
          href: '/dashboard/quality',
          icon: <Star className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'quality.view'
        },
        {
          label: 'HIPAA Management',
          href: '/dashboard/admin/compliance',
          icon: <Shield className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'audit.view'
        },
        {
          label: 'Audit Management',
          href: '/dashboard/audit-logs',
          icon: <ClipboardList className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'audit.view'
        },
        {
          label: 'IT Security',
          href: '/dashboard/admin/security',
          icon: <Key className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'session.view'
        },
        {
          label: 'Feedback & Surveys',
          href: '/dashboard/quality',
          icon: <Star className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'quality.view'
        }
      ]
    },

    // SECTION 9: Reporting & Analytics (3 modules)
    {
      title: 'Reporting & Analytics',
      icon: <BarChart className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Advanced Reports',
          href: '/dashboard/reports',
          icon: <FileText className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        },
        {
          label: 'Analytics & BI',
          href: '/dashboard/analytics',
          icon: <BarChart className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        },
        {
          label: 'Medical Records',
          href: '/dashboard/documents',
          icon: <FileText className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'document.view'
        }
      ]
    },

    // SECTION 10: Communication & Support (3 modules)
    {
      title: 'Communication & Support',
      icon: <Bell className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Helpdesk & Support',
          href: '/dashboard/referrals',
          icon: <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'referral.view'
        },
        {
          label: 'Communication',
          href: '/dashboard/notifications',
          icon: <Bell className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'notification.view'
        },
        {
          label: 'Housekeeping',
          href: '/dashboard/operations/cssd',
          icon: <Building className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'OPERATIONS:CSSD:VIEW'
        }
      ]
    },

    // SECTION 11: Administration (keep existing structure)
    {
      title: 'Administration',
      icon: <Settings className="h-5 w-5" strokeWidth={2.5} />,
      items: [
        {
          label: 'Overview',
          href: '/dashboard/admin/overview',
          icon: <LayoutDashboard className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null
        },
        // ORGANIZATION SECTION
        {
          label: 'Organization',
          href: '#',
          icon: <Building2 className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null,
          isSection: true
        },
        {
          label: 'Hierarchy Viewer',
          href: '/dashboard/admin/hierarchy',
          icon: <Activity className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'organization.view'
        },
        {
          label: 'Tenants',
          href: '/dashboard/admin/tenants',
          icon: <Building className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'tenant.view'
        },
        {
          label: 'Organizations',
          href: '/dashboard/organizations',
          icon: <Building2 className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'organization.view'
        },
        {
          label: 'Branches',
          href: '/dashboard/admin/branches',
          icon: <Building className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'branch.view'
        },
        {
          label: 'Departments',
          href: '/dashboard/departments',
          icon: <Briefcase className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'department.view'
        },
        // PEOPLE SECTION
        {
          label: 'People',
          href: '#',
          icon: <Users className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null,
          isSection: true
        },
        {
          label: 'Users & Employees',
          href: '/dashboard/admin/users',
          icon: <Users className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'user.view'
        },
        {
          label: 'HR Management',
          href: '/dashboard/admin/hr',
          icon: <UserCheck className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'employee.view',
          isExpandable: true,
          subItems: [
            {
              label: 'Onboarding',
              href: '/dashboard/admin/hr/onboarding',
              icon: <UserCheck className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'employee.view',
              isChild: true
            },
            {
              label: 'Licenses',
              href: '/dashboard/admin/licenses',
              icon: <FileCheck className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'license.view',
              isChild: true
            },
            {
              label: 'Performance',
              href: '/dashboard/admin/performance',
              icon: <TrendingUp className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'employee.view',
              isChild: true
            },
            {
              label: 'Training',
              href: '/dashboard/admin/training',
              icon: <GraduationCap className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'employee.view',
              isChild: true
            },
            {
              label: 'Attendance',
              href: '/dashboard/admin/attendance',
              icon: <ClipboardList className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'employee.view',
              isChild: true
            },
            {
              label: 'Leave Management',
              href: '/dashboard/admin/leave',
              icon: <Calendar className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'employee.view',
              isChild: true
            },
            {
              label: 'Payroll',
              href: '/dashboard/admin/payroll',
              icon: <DollarSign className="h-4 w-4" strokeWidth={2.5} />,
              requiredPermission: 'employee.view',
              isChild: true
            }
          ]
        },
        {
          label: 'Bulk Operations',
          href: '/dashboard/bulk-operations',
          icon: <Upload className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'bulk.import'
        },
        // ACCESS CONTROL SECTION
        {
          label: 'Access Control',
          href: '#',
          icon: <Shield className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null,
          isSection: true
        },
        {
          label: 'Roles & Permissions',
          href: '/dashboard/roles',
          icon: <Shield className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'role.view'
        },
        {
          label: 'Department Access',
          href: '/dashboard/admin/department-access',
          icon: <Key className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'department.view'
        },
        {
          label: 'Access Requests',
          href: '/dashboard/admin/access-requests',
          icon: <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'permission.view'
        },
        // SECURITY SECTION
        {
          label: 'Security',
          href: '#',
          icon: <Shield className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: null,
          isSection: true
        },
        {
          label: 'Security Dashboard',
          href: '/dashboard/admin/security',
          icon: <Shield className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'session.view'
        },
        {
          label: 'Audit Logs',
          href: '/dashboard/audit-logs',
          icon: <Activity className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'audit.view'
        },
        {
          label: 'Compliance Reports',
          href: '/dashboard/admin/compliance',
          icon: <FileCheck className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'audit.view'
        },
        // SETTINGS
        {
          label: 'System Settings',
          href: '/dashboard/system-settings',
          icon: <Settings className="h-4 w-4" strokeWidth={2.5} />,
          requiredPermission: 'system_settings.view'
        }
      ]
    }
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (href === '/dashboard' || exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
    {/* Desktop sidebar — hidden below lg (1024px) */}
    {!drawerOnly && (
    <nav className={`hidden lg:flex ${isCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'} bg-white shadow-sm overflow-y-auto flex-col h-full font-sans transition-all duration-300`} aria-label="Main navigation">
      {/* Header */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-200`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              title="Expand sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-gray-900">Hospital Portal</h1>
                <p className="text-gray-500 text-xs">Healthcare Excellence</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Collapse sidebar"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {menuSections.map((section) => {
          // Filter items based on permissions
          const visibleItems = section.items.filter(item => 
            !item.requiredPermission || hasPermission(item.requiredPermission)
          );

          // Don't show section if no items are visible
          if (visibleItems.length === 0) return null;

          const isOpen = openSection === section.title;
          const showSectionPopover = isCollapsed && collapsedPopover === section.title;

          return (
            <div key={section.title} className="mb-1 relative">
              {/* Section Header */}
              <button
                onClick={() => {
                  if (isCollapsed) {
                    setCollapsedPopover(showSectionPopover ? null : section.title);
                  } else {
                    toggleSection(section.title);
                  }
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                title={isCollapsed ? section.title : ''}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                  <span className="text-gray-800 font-bold group-hover:text-gray-900">
                    {section.icon}
                  </span>
                  {!isCollapsed && <span className="text-base font-bold text-gray-800">{section.title}</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`} />
                )}
              </button>

              {/* Collapsed Section Popover */}
              {showSectionPopover && (
                <div className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[240px] max-h-[600px] overflow-y-auto z-50">
                  <div className="px-4 py-2 text-sm font-bold text-gray-700 border-b border-gray-100 sticky top-0 bg-white">
                    {section.title}
                  </div>
                  {(() => {
                    let currentSubsection: string | null = null;
                    return visibleItems.map((item, index) => {
                      // Handle subsection headers
                      if (item.isSection) {
                        currentSubsection = item.label;
                        return (
                          <div key={`section-${item.label}`} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 first:mt-2">
                            {item.label}
                          </div>
                        );
                      }
                      
                      const active = isActive(item.href);
                      
                      // Handle expandable items with sub-items (e.g., HR Management)
                      if (item.isExpandable && item.subItems) {
                        return (
                          <div key={item.label}>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-600 mt-2 flex items-center gap-2">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {item.subItems.map((subItem) => {
                              const subActive = isActive(subItem.href, subItem.exact);
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setCollapsedPopover(null)}
                                  className={`
                                    flex items-center gap-3 px-6 py-2 transition-all duration-150
                                    ${subActive
                                      ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                                      : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                                    }
                                  `}
                                >
                                  <span className={`text-xs ${subActive ? 'text-teal-600' : 'text-gray-600'}`}>
                                    {subItem.icon}
                                  </span>
                                  <span className="text-sm">{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        );
                      }
                      
                      // Regular item
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setCollapsedPopover(null)}
                          className={`
                            flex items-center gap-3 px-4 py-2 transition-all duration-150
                            ${active
                              ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                              : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                            }
                          `}
                        >
                          <span className={`${active ? 'text-teal-600' : 'text-gray-600'}`}>
                            {item.icon}
                          </span>
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      );
                    });
                  })()}
                </div>
              )}

              {/* Section Items */}
              {isOpen && !isCollapsed && (
                <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  // Render subsection header
                  if (item.isSection) {
                    const isSubsectionExpanded = expandedSubsections.includes(item.label);
                    if (isCollapsed) return null; // Don't show subsection headers when collapsed
                    return (
                      <div key={item.label} className="ml-4 mr-2">
                        <button
                          onClick={() => toggleSubsection(item.label)}
                          className="w-full flex items-center justify-between px-3 py-2.5 mt-3 mb-1 rounded-md bg-gray-50 hover:bg-teal-50/50 transition-colors group border-l-2 border-gray-300"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-gray-600 group-hover:text-teal-600 font-bold">
                              {item.icon}
                            </span>
                            <span className="text-sm font-bold text-gray-700 group-hover:text-teal-600">{item.label}</span>
                          </div>
                          <ChevronRight className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
                            isSubsectionExpanded ? 'rotate-90' : ''
                          }`} />
                        </button>
                      </div>
                    );
                  }

                  // Check if item is under a subsection
                  const itemIndex = visibleItems.indexOf(item);
                  const previousItems = visibleItems.slice(0, itemIndex);
                  const lastSubsection = previousItems.reverse().find(i => i.isSection);
                  
                  // If there's a subsection before this item and it's not expanded, don't show the item
                  if (lastSubsection && !expandedSubsections.includes(lastSubsection.label)) {
                    return null;
                  }

                  const active = isActive(item.href);
                  
                  // Determine if this is a subsection item (comes after a section header)
                  const isSubsectionItem = !!lastSubsection;
                  
                  const baseClass = item.isChild 
                    ? "pl-12 pr-4 py-2.5" 
                    : isSubsectionItem
                    ? "pl-6 pr-4 py-2.5"
                    : "pl-4 pr-4 py-2.5";
                  
                  // Render expandable menu item with submenu
                  if (item.isExpandable && item.subItems) {
                    const isExpanded = expandedItems.includes(item.label);
                    if (isCollapsed) {
                      // Show only icon with popover for sub-items when collapsed
                      const showPopover = collapsedPopover === item.label;
                      return (
                        <div key={item.label} className="mx-2 relative">
                          <button
                            onClick={() => setCollapsedPopover(showPopover ? null : item.label)}
                            className={`
                              w-full flex items-center justify-center py-3 rounded-md transition-all duration-150
                              ${active
                                ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                                : 'text-gray-800 hover:bg-teal-50/50 hover:text-teal-600'
                              }
                            `}
                            title={item.label}
                          >
                            <span className={`font-bold ${active ? 'text-teal-600' : 'text-gray-600'}`}>
                              {item.icon}
                            </span>
                          </button>
                          {showPopover && item.subItems && (
                            <div className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                              <div className="px-4 py-2 text-sm font-bold text-gray-700 border-b border-gray-100">
                                {item.label}
                              </div>
                              {item.subItems.map((subItem) => {
                                const subActive = isActive(subItem.href, subItem.exact);
                                return (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={() => setCollapsedPopover(null)}
                                    className={`
                                      flex items-center gap-3 px-4 py-2.5 transition-all duration-150
                                      ${subActive
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                                      }
                                    `}
                                  >
                                    <span className={`font-bold ${subActive ? 'text-teal-600' : 'text-gray-600'}`}>
                                      {subItem.icon}
                                    </span>
                                    <span className="font-bold text-sm">{subItem.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div key={item.label} className="mx-2">
                        <button
                          onClick={() => toggleSubmenu(item.label)}
                          className={`
                            w-full flex items-center justify-between ${baseClass} rounded-md transition-all duration-150
                            ${active
                              ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                              : 'text-gray-800 hover:bg-teal-50/50 hover:text-teal-600'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`font-bold ${active ? 'text-teal-600' : 'text-gray-600'}`}>
                              {item.icon}
                            </span>
                            <span className="font-bold text-sm">{item.label}</span>
                          </div>
                          <ChevronRight className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          }`} />
                        </button>
                        {isExpanded && item.subItems.map((subItem) => {
                          const subActive = isActive(subItem.href, subItem.exact);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`
                                flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-md transition-all duration-150
                                ${subActive
                                  ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                                  : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                                }
                              `}
                            >
                              <span className={`font-bold ${subActive ? 'text-teal-600' : 'text-gray-600'}`}>
                                {subItem.icon}
                              </span>
                              <span className="font-bold text-sm">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }

                  // Render menu item
                  if (isCollapsed) {
                    // Show only icon with tooltip when collapsed
                    return (
                      <div key={item.href} className="mx-2" title={item.label}>
                        <Link
                          href={item.href}
                          className={`
                            flex items-center justify-center py-3 rounded-md transition-all duration-150
                            ${active
                              ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                              : 'text-gray-800 hover:bg-teal-50/50 hover:text-teal-600'
                            }
                          `}
                        >
                          <span className={`font-bold ${active ? 'text-teal-600' : 'text-gray-600'}`}>
                            {item.icon}
                          </span>
                        </Link>
                      </div>
                    );
                  }
                  return (
                    <div key={item.href} className="mx-2">
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 ${baseClass} rounded-md transition-all duration-150
                          ${active
                            ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600'
                            : 'text-gray-800 hover:bg-teal-50/50 hover:text-teal-600'
                          }
                        `}
                      >
                        <span className={`font-bold ${active ? 'text-teal-600' : 'text-gray-600'}`}>
                          {item.icon}
                        </span>
                        <span className="font-bold text-sm flex-1">{item.label}</span>
                        {item.badge}
                      </Link>
                    </div>
                  );
                })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help & Settings Footer */}
      <div className="border-t border-gray-200 p-3 flex-shrink-0">
        <Link
          href="/dashboard/settings"
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-md text-base text-gray-800 hover:bg-teal-50/50 hover:text-teal-600 transition-colors mb-1`}
          title={isCollapsed ? "Settings" : ""}
        >
          <Settings className="h-5 w-5 text-gray-600 font-bold" />
          {!isCollapsed && <span className="font-bold">Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-md text-base text-red-600 hover:bg-red-50 transition-colors`}
          title={isCollapsed ? "Logout" : ""}
        >
          <LogOut className="h-5 w-5 font-bold" />
          {!isCollapsed && <span className="font-bold">Logout</span>}
        </button>
      </div>
    </nav>
    )}

    {/* Mobile / tablet slide-in drawer — visible only when isMobileOpen=true, on screens < lg */}
    {isMobileOpen && (
      <>
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Drawer panel */}
        <nav
          className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl flex flex-col h-full font-sans overflow-y-auto lg:hidden"
          aria-label="Mobile navigation"
        >
          {/* Drawer header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-gray-900">Hospital Portal</h1>
                <p className="text-gray-500 text-xs">Healthcare Excellence</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Drawer nav items — same structure as desktop, never collapsed */}
          <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {menuSections.map((section) => {
              const visibleItems = section.items.filter(item =>
                !item.requiredPermission || hasPermission(item.requiredPermission)
              );
              if (visibleItems.length === 0) return null;
              const isOpen = openSection === section.title;
              return (
                <div key={section.title} className="mb-1">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-800 font-bold group-hover:text-gray-900">{section.icon}</span>
                      <span className="text-base font-bold text-gray-800">{section.title}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="space-y-0.5">
                      {visibleItems.map((item) => {
                        if (item.isSection) {
                          return (
                            <div key={item.label} className="ml-4 mr-2">
                              <div className="flex items-center gap-2.5 px-3 py-2.5 mt-3 mb-1 rounded-md bg-gray-50 border-l-2 border-gray-300">
                                <span className="text-gray-600 font-bold">{item.icon}</span>
                                <span className="text-sm font-bold text-gray-700">{item.label}</span>
                              </div>
                            </div>
                          );
                        }
                        const active = isActive(item.href);
                        if (item.isExpandable && item.subItems) {
                          const isExpanded = expandedItems.includes(item.label);
                          return (
                            <div key={item.label} className="mx-2">
                              <button
                                onClick={() => toggleSubmenu(item.label)}
                                className={`w-full flex items-center justify-between pl-4 pr-4 py-2.5 rounded-md transition-all duration-150 ${
                                  active ? 'bg-teal-50 text-teal-700' : 'text-gray-800 hover:bg-teal-50/50 hover:text-teal-600'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`font-bold ${active ? 'text-teal-600' : 'text-gray-600'}`}>{item.icon}</span>
                                  <span className="font-bold text-sm">{item.label}</span>
                                </div>
                                <ChevronRight className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                              {isExpanded && item.subItems.map((subItem) => {
                                const subActive = isActive(subItem.href, subItem.exact);
                                return (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-md transition-all duration-150 ${
                                      subActive ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600' : 'text-gray-700 hover:bg-teal-50/50 hover:text-teal-600'
                                    }`}
                                  >
                                    <span className={`font-bold ${subActive ? 'text-teal-600' : 'text-gray-600'}`}>{subItem.icon}</span>
                                    <span className="font-bold text-sm">{subItem.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          );
                        }
                        return (
                          <div key={item.href} className="mx-2">
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={`flex items-center gap-3 pl-4 pr-4 py-2.5 rounded-md transition-all duration-150 ${
                                active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600' : 'text-gray-800 hover:bg-teal-50/50 hover:text-teal-600'
                              }`}
                            >
                              <span className={`font-bold ${active ? 'text-teal-600' : 'text-gray-600'}`}>{item.icon}</span>
                              <span className="font-bold text-sm flex-1">{item.label}</span>
                              {item.badge}
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Drawer footer */}
          <div className="border-t border-gray-200 p-3 flex-shrink-0">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 rounded-md text-base text-gray-800 hover:bg-teal-50/50 hover:text-teal-600 transition-colors mb-1"
            >
              <Settings className="h-5 w-5 text-gray-600 font-bold" />
              <span className="font-bold">Settings</span>
            </Link>
            <button
              onClick={() => { handleLogout(); onClose?.(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-base text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5 font-bold" />
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </nav>
      </>
    )}
    </>
  );
}
