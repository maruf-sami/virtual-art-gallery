"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './art-details.module.css';

export default function ArtworkDetailsPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const artworkId = unwrappedParams.id;

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtworkDetails() {
      try {
        const response = await fetch(`/api/gallery/${artworkId}`);
        if (response.ok) {
          const data = await response.json();
          setArtwork(data);
        }
      } catch (error) {
        console.error("Error fetching artwork from DB:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArtworkDetails();
  }, [artworkId]);

  if (loading) {
    return (
      <div className={styles.fallbackContainer}>
        <p className={styles.statusText}>Loading artwork details from studio...</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className={styles.fallbackContainer}>
        <h2 className={styles.errorTitle}>Artwork Not Found</h2>
        <p className={styles.errorSub}>
          Looking for ID: <span className={styles.debugId}>{artworkId}</span>
        </p>
        <button 
          onClick={() => router.push('/gallery')}
          className={styles.backLinkBtn}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detailsContainer}>
      
      <button 
        onClick={() => router.back()}
        className={styles.backArrowBtn}
        title="Go Back"
      >
        <span className={styles.arrowIcon}>←</span>
      </button>

      <main className={styles.mainWrapper}>
        
        <div className={styles.imageSection}>
          <div className={styles.imageCage}>
            <img 
              src={artwork.image} 
              alt={artwork.title}
              className={styles.displayImage}
            />
          </div>
        </div>

        <aside className={styles.infoSection}>
          
          <div className={styles.titleBlock}>
            <h1 className={styles.artTitle}>
              {artwork.title}
            </h1>
            <div className={styles.divider}></div>
          </div>

          <div className={styles.metaGrid}>
            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>ARTIST</span>
              <Link 
                href={`/artists/${artwork.artistId}`}
                className={styles.artistProfileLink}
              >
                <div 
                  className={styles.artistAvatar}
                  style={{ backgroundColor: artwork.avatarColor || '#E9C349' }}
                >
                  {artwork.initials || (artwork.artist_name ? artwork.artist_name.charAt(0) : 'A')}
                </div>
                <span className={styles.artistName}>
                  {artwork.artist_name}
                </span>
              </Link>
            </div>

            <div className={`${styles.metaBox} ${styles.alignBottom}`}>
              <span className={styles.metaLabel}>CATEGORY</span>
              <span className={styles.categoryValue}>{artwork.category}</span>
            </div>

            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>MEDIUM / TOOLS</span>
              <span className={styles.metaValue}>{artwork.medium || 'N/A'}</span>
            </div>

            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>DIMENSIONS</span>
              <span className={styles.metaValue}>{artwork.dimension || 'N/A'}</span>
            </div>

          </div>

          {artwork.artist_note && (
            <div className={styles.storyBox}>
              <span className={styles.metaLabel}>ARTIST NOTE</span>
              <p className={styles.storyText}>{artwork.artist_note}</p>
            </div>
          )}

          <div className={styles.actionBlock}>
            <button className={styles.collectBtn}>
              <span className={styles.collectBtnText}>
                Collect Artwork
              </span>
            </button>
          </div>

        </aside>
      </main>
    </div>
  );
}