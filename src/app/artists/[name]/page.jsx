"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import styles from './artists.module.css';

export default function ArtistsPage() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setArtworks(data);
        }
      } catch (error) {
        console.error("Error fetching data for artists list:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGalleryData();
  }, []);

  const uniqueArtists = useMemo(() => {
    const seenNames = new Set();
    const list = [];
    
    artworks.forEach(art => {
      const name = art.artist_name ? art.artist_name.trim() : "Unknown Artist";
      if (!seenNames.has(name.toLowerCase())) {
        seenNames.add(name.toLowerCase());
        list.push({
          artist_name: name,
          category: art.category || "General"
        });
      }
    });
    return list;
  }, [artworks]);

  if (loading) {
    return (
      <div className={styles.artistsContainer}>
        <p className={styles.statusText}>Connecting to studio & indexing creators...</p>
      </div>
    );
  }

  return (
    <div className={styles.artistsContainer}>
      <div className={styles.maxWrapper}>
        
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Our Resident Artists</h1>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.artistsGrid}>
          {uniqueArtists.map((artist) => {
            const totalArts = artworks.filter(art => art.artist_name?.trim().toLowerCase() === artist.artist_name.toLowerCase()).length;
            const initialLetter = artist.artist_name.charAt(0).toUpperCase();

            return (
              <Link 
                key={artist.artist_name}
                href={`/artists/${encodeURIComponent(artist.artist_name)}`}
                className={styles.artistCard}
              >
                <div className={styles.avatarCircle}>
                  {initialLetter}
                </div>

                <h2 className={styles.artistName}>
                  {artist.artist_name}
                </h2>
                <p className={styles.specialityText}>
                  {artist.category} Specialist
                </p>
                
                <div className={styles.counterBox}>
                  Total Artworks: <span className={styles.counterNumber}>{totalArts}</span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
