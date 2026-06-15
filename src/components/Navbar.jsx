'use client';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar({ user }) {

  const profileHref = user && user.isLoggedIn ? '/profile' : '/artists';

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
            {user.role === 'artist' && (
              <Link href="/gallery/upload">
                <button className={styles.uploadBtn}>Upload</button>
              </Link>
            )}

            <Link href={profileHref} className={styles.profileLink}>
              <span className={styles.profileName}>{user.name}</span>
              <div className={styles.profileAvatar} aria-hidden>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </Link>
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
