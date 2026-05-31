import Link from 'next/link';
import Image from 'next/image';
import { Menu, Search } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
    const navItems = [
        { href: '/', label: 'Home' },
        { href: '/maine-news', label: 'News' },
        { href: '/maine-politics', label: 'Politics' },
        { href: '/maine-crime', label: 'Crime' },
        { href: '/maine-business', label: 'Business' },
        { href: '/weather', label: 'Weather' },
        { href: '/maine-sports', label: 'Sports' },
        { href: '/maine-opinion', label: 'Opinion' },
        { href: '/sections', label: 'Sections' },
    ];

    return (
        <header className={styles.header}>
            <div className={`${styles.container} ${styles.desktopMasthead}`}>
                <Link href="/" className={styles.logoWrapper}>
                    <Image
                        src="/header-desktop.png"
                        alt="Maine News Now"
                        width={2140}
                        height={735}
                        className={styles.logoImage}
                        priority
                    />
                </Link>
            </div>

            <div className={`${styles.container} ${styles.navBand}`}>
                <Link href="/sections" className={styles.utilityButton} aria-label="Open sections">
                    <Menu size={20} />
                </Link>

                <nav className={styles.desktopNav}>
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={styles.desktopNavLink}>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.desktopActions}>
                    <Link href="/latest" className={styles.secondaryAction}>Latest</Link>
                    <Link href="/search" className={styles.utilityButton} aria-label="Search">
                        <Search size={20} />
                    </Link>
                </div>
            </div>

            <div className={`${styles.container} ${styles.mobileHeader}`}>
                <Link href="/sections" className={styles.utilityButton} aria-label="Open sections">
                    <Menu size={20} />
                </Link>

                <Link href="/" className={styles.mobileLogo}>
                    <Image
                        src="/header-mobile.png"
                        alt="Maine News Now"
                        width={2508}
                        height={627}
                        className={styles.mobileLogoImage}
                        priority
                    />
                </Link>

                <Link href="/search" className={styles.utilityButton} aria-label="Search">
                    <Search size={20} />
                </Link>
            </div>
        </header>
    );
}
