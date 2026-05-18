'use client'; 
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar({ user }) {

  return (
    <nav className={styles.navbar}>
      <div>
        <Link href="/" className={styles.logo}>
          Virtual Art Gallery
        </Link>
      </div>

      <div className={styles.navLinks}>
        <Link href="/gallery" className={styles.navLink}>
          Gallery
        </Link>
        <Link href="/artists" className={styles.navLink}>
          Artists
        </Link>
      </div>

      <div>
        {user && user.isLoggedIn ? (
          <div className={styles.profileContainer}>
            <span className={styles.profileName}>{user.name}</span>
            <div className={styles.profileAvatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        ) : (
          <Link href="/auth">
            <button className={styles.navButton}>
              <span className={styles.navButtonText}>Log In</span>
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
