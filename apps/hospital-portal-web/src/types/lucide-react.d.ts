/**
 * Type declarations for lucide-react icons
 * This resolves React 18 compatibility warnings
 */
declare module 'lucide-react' {
  import { FC, SVGProps, ReactElement } from 'react';
  
  export type IconProps = SVGProps<SVGSVGElement> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  };
  
  // Use explicit ReactElement return type for React 18 compatibility
  export type Icon = (props: IconProps) => ReactElement;
  
  export const Activity: Icon;
  export const AlertCircle: Icon;
  export const AlertTriangle: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const Baby: Icon;
  export const BadgeAlert: Icon;
  export const BedDouble: Icon;
  export const Bell: Icon;
  export const Bookmark: Icon;
  export const BookMarked: Icon;
  export const BookOpen: Icon;
  export const Building2: Icon;
  export const Calendar: Icon;
  export const CalendarClock: Icon;
  export const Camera: Icon;
  export const Check: Icon;
  export const CheckCircle: Icon;
  export const CheckCircle2: Icon;
  export const ChevronDown: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const ChevronUp: Icon;
  export const Circle: Icon;
  export const ClipboardList: Icon;
  export const Clock: Icon;
  export const Copy: Icon;
  export const CreditCard: Icon;
  export const DollarSign: Icon;
  export const Download: Icon;
  export const Edit: Icon;
  export const ExternalLink: Icon;
  export const Eye: Icon;
  export const FileSignature: Icon;
  export const FileText: Icon;
  export const FileUp: Icon;
  export const Filter: Icon;
  export const Flask: Icon;
  export const Globe: Icon;
  export const Grid: Icon;
  export const Heart: Icon;
  export const Home: Icon;
  export const Image: Icon;
  export const IndianRupee: Icon;
  export const Info: Icon;
  export const Link: Icon;
  export const Link2: Icon;
  export const List: Icon;
  export const Loader2: Icon;
  export const LogOut: Icon;
  export const MapPin: Icon;
  export const MessageSquare: Icon;
  export const Minus: Icon;
  export const Monitor: Icon;
  export const Package: Icon;
  export const Package2: Icon;
  export const PartyPopper: Icon;
  export const Pen: Icon;
  export const Pin: Icon;
  export const Plus: Icon;
  export const Phone: Icon;
  export const Printer: Icon;
  export const RefreshCw: Icon;
  export const Scissors: Icon;
  export const Search: Icon;
  export const Send: Icon;
  export const Shield: Icon;
  export const ShieldAlert: Icon;
  export const Split: Icon;
  export const Star: Icon;
  export const Stethoscope: Icon;
  export const Syringe: Icon;
  export const Table: Icon;
  export const Tag: Icon;
  export const Trash: Icon;
  export const TrendingUp: Icon;
  export const Upload: Icon;
  export const User: Icon;
  export const UserCheck: Icon;
  export const UserPlus: Icon;
  export const Users: Icon;
  export const UserX: Icon;
  export const X: Icon;
  export const XCircle: Icon;
  export const Zap: Icon;
  export const ClipboardCopy: Icon;
  export const CloudUpload: Icon;
  export const FileImage: Icon;
  export const FlaskConical: Icon;
  export const FolderOpen: Icon;
  export const Inbox: Icon;
  export const Share2: Icon;
  export const Trash2: Icon;
}
