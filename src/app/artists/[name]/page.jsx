"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './artist-profile.module.css';

export default function ArtistProfilePage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);

  const artistNameFromUrl = decodeURIComponent(unwrappedParams.name);

  const [artistWorks, setArtistWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtistCollection() {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const allData = await response.json();

          const filteredData = allData.filter(
            art => art.artist_name?.trim().toLowerCase() === artistNameFromUrl.toLowerCase()
          );
          setArtistWorks(filteredData);
        }
      } catch (error) {
        console.error("Error fetching artist collection from DB:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtistCollection();
  }, [artistNameFromUrl]);

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <p className={styles.statusText}>Assembling artist exhibition room...</p>
      </div>
    );
  }

  if (artistWorks.length === 0) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.maxWrapper} style={{ textAlign: 'center' }}>
          <h2 className={styles.profileName}>Artist Profile Empty</h2>
          <p className={styles.statusText}>No catalogued works found for "{artistNameFromUrl}".</p>
          <button onClick={() => router.push('/artists')} className={styles.backBtn}>
            Return to Artists Registry
          </button>
        </div>
      </div>
    );
  }

  const currentArtistName = artistWorks[0].artist_name || artistNameFromUrl;
  const currentArtistCategory = artistWorks[0].category || "Fine Art";

  return (
    <div className={styles.profileContainer}>
      <div className={styles.maxWrapper}>
        
        <button onClick={() => router.push('/artists')} className={styles.arrowBack} title="All Artists">
          <span>← Back to Artists</span>
        </button>

        <header className={styles.profileHeader}>
          <div className={styles.profileAvatarLarge}>
            {currentArtistName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.profileName}>{currentArtistName}</h1>
            <p className={styles.profileSpec}>{currentArtistCategory} Specialist</p>
            <span className={styles.totalBadge}>{artistWorks.length} Exhibition Pieces</span>
          </div>
        </header>

        <div className={styles.showcaseDivider}>
          <span className={styles.dividerTitle}>Collection Showcase</span>
        </div>

        <div className={styles.portfolioGrid}>
          {artistWorks.map((art) => (
            <Link 
              key={art._id} 
              href={`/gallery/${art._id}`}
              className={styles.portfolioCard}
            >
              <div className={styles.imageHolder}>
                <img 
                  src={art.image} 
                  alt={art.title} 
                  className={styles.artImg}
                />
              </div>
              <div className={styles.artDetails}>
                <span className={styles.artCat}>{art.category}</span>
                <h3 className={styles.artTitle}>{art.title}</h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
