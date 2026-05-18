'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';

export default function GalleryPage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setArtworks(data);
          setFilteredArtworks(data);

          const uniqueCategories = ['All', ...new Set(data.map((art) => art.category || 'Other'))];
          setCategories(uniqueCategories);
        } else {
          setError('Failed to load gallery');
        }
      } catch (error) {
        console.error('Error fetching gallery data:', error);
        setError('Error loading gallery');
      } finally {
        setLoading(false);
      }
    }
    fetchGalleryData();
  }, []);

  useEffect(() => {
    let result = artworks;

    if (selectedCategory !== 'All') {
      result = result.filter((art) => art.category === selectedCategory);
    }

    if (sortBy === 'most-liked') {
      result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
    } else {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    setFilteredArtworks(result);
  }, [selectedCategory, sortBy, artworks]);

  const handleArtistNavigation = (e, artistId) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/artists/${artistId}`);
  };

  if (loading) {
    return (
      <div className={styles.galleryContainer}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.galleryContainer}>
        <div className={styles.errorWrapper}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Virtual Gallery</h1>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.filterSortWrapper}>
          {categories.length > 0 && (
            <div className={styles.filterSection}>
              <div className={styles.filterLabel}>Category</div>
              <div className={styles.filterContainer}>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`${styles.filterButton} ${
                      selectedCategory === category ? styles.active : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sortSection}>
            <label htmlFor="sort-select" className={styles.sortLabel}>
              Sort By
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
        </div>

        {filteredArtworks.length > 0 ? (
          <div className={styles.grid}>
            {filteredArtworks.map((art) => (
              <Link
                key={art._id}
                href={`/gallery/${art._id}`}
                className={styles.card}
              >
                <div className={styles.imageBox}>
                  <img
                    src={art.image}
                    alt={art.title}
                    className={styles.image}
                  />
                </div>

                <div className={styles.metadata}>
                  <span className={styles.category}>
                    {art.category || 'Artwork'}
                  </span>

                  <h2 className={styles.artTitle}>
                    {art.title}
                  </h2>

                  <button
                    className={styles.artistButton}
                    onClick={(e) => handleArtistNavigation(e, art.artistId)}
                  >
                    {art.artist_name || 'Unknown Artist'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyWrapper}>
            <p>No artworks found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}