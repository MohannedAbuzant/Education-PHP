import { type NavItem } from '@/types';
import { BookOpen, Folder } from 'lucide-react';

const REPOSITORY_URL = 'https://github.com/MohannedAbuzant/Education-PHP';

/** The Repository and Documentation links: the sidebar footer and the header's right-hand navigation both show these. */
export const footerNavItems: NavItem[] = [
    { title: 'Repository', url: REPOSITORY_URL, icon: Folder },
    { title: 'Documentation', url: `${REPOSITORY_URL}#readme`, icon: BookOpen },
];
