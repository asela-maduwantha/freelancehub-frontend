import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  DollarSign,
  Settings,
  FileText,
  Users,
  CreditCard,
  Target,
  User
} from 'lucide-react';
import { NavItem } from '@/lib/types';

export const clientNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/client/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & insights'
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/client/projects',
    icon: Briefcase,
    description: 'Manage your projects'
  },
  {
    id: 'freelancers',
    label: 'Find Talent',
    href: '/client/freelancers',
    icon: Users,
    description: 'Browse freelancers',
    isNew: true
  },
  {
    id: 'proposals',
    label: 'Proposals',
    href: '/client/proposals',
    icon: FileText,
    badge: 5,
    description: 'Review submissions'
  },
  {
    id: 'contracts',
    label: 'Contracts',
    href: '/client/contracts',
    icon: Target,
    description: 'Active agreements'
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/client/messages',
    icon: MessageSquare,
    badge: 8,
    description: 'Team communications'
  },
  {
    id: 'payments',
    label: 'Payments',
    href: '/client/payments',
    icon: CreditCard,
    description: 'Billing, invoices & milestone approvals'
  },
  {
    id: 'profile',
    label: 'Company Profile',
    href: '/client/profile',
    icon: User,
    description: 'Edit company details'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/client/settings',
    icon: Settings,
    description: 'Account preferences'
  }
];
