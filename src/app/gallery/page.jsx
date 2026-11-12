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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMedium, setSelectedMedium] = useState('All');
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [sortBy, setSortBy] = useState('latest');

  const [categories, setCategories] = useState([]);
  const [mediums, setMediums] = useState([]);
  const [uniqueArtists, setUniqueArtists] = useState([]);

  useEffect(() => {
    async function fetchGalleryData() {
      try {
        const response = await fetch('/api/gallery');
        if (response.ok) {
          const data = await response.json();
          setArtworks(data);
          setFilteredArtworks(data);

          const uniqueCats = ['All', ...new Set(data.map((art) => art.category || 'Other'))];
          setCategories(uniqueCats);

          const uniqueMeds = ['All', ...new Set(data.map((art) => art.medium || 'Other'))];
          setMediums(uniqueMeds);

          const artistList = [...new Set(data.map((art) => art.artist_name).filter(Boolean))];
          setUniqueArtists(artistList);
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

  const handleArtistCheckboxChange = (artistName) => {
    if (selectedArtists.includes(artistName)) {
      setSelectedArtists(selectedArtists.filter((name) => name !== artistName));
    } else {
      setSelectedArtists([...selectedArtists, artistName]);
    }
  };

  useEffect(() => {
    let result = [...artworks];

    if (selectedCategory !== 'All') {
      result = result.filter((art) => art.category === selectedCategory);
    }

    if (selectedMedium !== 'All') {
      result = result.filter((art) => art.medium === selectedMedium);
    }

    if (selectedArtists.length > 0) {
      result = result.filter((art) => selectedArtists.includes(art.artist_name));
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const matchedByTitle = result.filter((art) => (art.title || '').toLowerCase().includes(query));
      const matchedByArtist = result.filter((art) =>
        !(art.title || '').toLowerCase().includes(query) &&
        (art.artist_name || '').toLowerCase().includes(query)
      );
      const matchedByDetails = result.filter((art) =>
        !(art.title || '').toLowerCase().includes(query) &&
        !(art.artist_name || '').toLowerCase().includes(query) &&
        (art.artist_note || '').toLowerCase().includes(query)
      );
      result = [...matchedByTitle, ...matchedByArtist, ...matchedByDetails];
    }

    if (sortBy === 'most-liked') {
      result.sort((a, b) => (b.love_count || 0) - (a.love_count || 0));
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
  }, [selectedCategory, selectedMedium, selectedArtists, searchQuery, sortBy, artworks]);

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
    <div className={styles.outerLayout}>

      {}
      <aside className={styles.leftAside}>
        <h3 className={styles.asideTitle}>Artists</h3>
        <div className={styles.artistCheckboxList}>
          {uniqueArtists.map((artist) => (
            <label key={artist} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedArtists.includes(artist)}
                onChange={() => handleArtistCheckboxChange(artist)}
                className={styles.customCheckbox}
              />
              <span className={styles.checkboxText}>{artist}</span>
            </label>
          ))}
        </div>
        {selectedArtists.length > 0 && (
          <button className={styles.clearFilterBtn} onClick={() => setSelectedArtists([])}>
            Reset Filter
          </button>
        )}
      </aside>

      {}
      <div className={styles.galleryContainer}>
        <div className={styles.wrapper}>

          <div className={styles.header}>
            <h1 className={styles.title}>Virtual Gallery</h1>
            <div className={styles.divider}></div>
          </div>

          {}
          <div className={styles.searchSortRow}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by title, artist, story..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.compactControls}>
              {}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.miniSelect}
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {}
              <select
                value={selectedMedium}
                onChange={(e) => setSelectedMedium(e.target.value)}
                className={styles.miniSelect}
              >
                <option value="All">All Mediums</option>
                {mediums.filter(m => m !== 'All').map(med => (
                  <option key={med} value={med}>{med}</option>
                ))}
              </select>

              {}
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

          {}
          {filteredArtworks.length > 0 ? (
            <div className={styles.grid}>
              {filteredArtworks.map((art) => (
                <Link key={art._id} href={`/gallery/${art._id}`} className={styles.card}>
                  <div className={styles.imageBox}>
                    <img src={art.image} alt={art.title} className={styles.image} />
                  </div>

                  <div className={styles.metadata}>
                    <span className={styles.category}>
                      {art.category || 'Artwork'} {art.medium ? `• ${art.medium}` : ''}
                    </span>

                    <h2 className={styles.artTitle}>{art.title}</h2>

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

    </div>
  );
}