'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Grid2x2, Search, MessageSquarePlus } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Sections', href: '/sections', icon: Grid2x2 },
        { label: 'Latest', href: '/latest', icon: Newspaper },
        { label: 'Tips', href: '/submit', icon: MessageSquarePlus },
        { label: 'Search', href: '/search', icon: Search },
    ];

    const [visible, setVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            const isScrollingUp = prevScrollPos > currentScrollPos;

            // Show if scrolling up or at the top
            setVisible(isScrollingUp || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    return (
        <>
            <div className={`${styles.navProxy} ${visible ? '' : styles.hidden}`} aria-hidden="true" />
            <nav className={`${styles.bottomNav} ${visible ? '' : styles.hidden}`}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                        >
                            {item.icon && <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />}
                            <span className={styles.navLabel}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
