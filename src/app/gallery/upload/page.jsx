
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './upload.module.css';

export default function UploadArtworkPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Abstract',
    height: '',
    width: '',
    medium: 'Oil on Canvas',
    artist_note: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const predefinedMediums = [
    "Oil on Canvas",
    "Acrylic on Canvas",
    "Watercolor",
    "Charcoal / Pencil Sketch",
    "Digital 2D Illustration",
    "Blender / 3D Render",
    "Sculpture / Clay",
    "Mixed Media"
  ];

  useEffect(() => {
    async function checkArtistAuth() {
      try {
        const res = await fetch('/api/auth');

        if (!res.ok) {
          alert("Access Denied: Please log in first.");
          router.push('/auth');
          return;
        }

        const userData = await res.json();

        if (userData.role !== 'artist') {
          alert(Restricted Access: Your role is "${userData.role}". Only registered artists can exhibit artworks.);
          router.push('/gallery');
          return;
        }

        setCheckingAuth(false);
      } catch (error) {
        console.error("Auth protection error:", error);
        router.push('/gallery');
      }
    }
    checkArtistAuth();
  }, [router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setStatus({ type: 'error', message: 'Please select an artwork image file.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    const combinedDimension = ${formData.height.trim()}x${formData.width.trim()};

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('dimension', combinedDimension);
    data.append('medium', formData.medium);
    data.append('artist_note', formData.artist_note);
    data.append('image', imageFile);

    try {
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Masterpiece uploaded and saved successfully!' });

        // রিসেট করার সময় ডিফল্ট মিডিয়াম 'Oil on Canvas' রাখা হয়েছে
        setFormData({ title: '', category: 'Abstract', height: '', width: '', medium: 'Oil on Canvas', artist_note: '' });
        setImageFile(null);
        setFileName('');

        setTimeout(() => {
          router.push("/gallery");
        }, 1200);
      } else {
        setStatus({ type: 'error', message: result.message || 'Upload failed.' });
      }
    } catch (error) {
      console.error('Form Submit Error:', error);
      setStatus({ type: 'error', message: 'Network error. Failed to connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.uploadContainer}>
        <div className={styles.formWrapper}>
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0', fontSize: '1.1rem' }}>
            Verifying Artist Credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.pageTitle}>Exhibit Your Artwork</h1>

        <form onSubmit={handleSubmit} className={styles.uploadForm}>

          {/* Artwork File */}
          <div className={styles.inputGroup}>
            <label>Artwork File</label>
            <div className={styles.fileInputWrapper} onClick={() => document.getElementById('artFileInput').click()}>
              <p>{fileName ? Selected: ${fileName} : 'Drag & Drop or Click to Upload Image (JPG, PNG)'}</p>
              <input
                id="artFileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Artwork Title */}
          <div className={styles.inputGroup}>
            <label>Artwork Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className={styles.inputField} placeholder="e.g., The Golden Cipher" />
          </div>

          {/* Category */}
          <div className={styles.inputGroup}>
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className={styles.selectField}>
              <option value="Abstract">Abstract</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Classical Painting">Classical Painting</option>
              <option value="Sculpture">Sculpture</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className={styles.inputGroup}>
            <label>Dimensions (Height × Width)</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleInputChange}
                required
                className={styles.inputField}
                placeholder="Height (e.g. 12)"
                min="0"
                step="any"
              />
              <span style={{ color: '#888', fontWeight: 'bold' }}>×</span>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleInputChange}
                required
                className={styles.inputField}
                placeholder="Width (e.g. 30)"
                min="0"
                step="any"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Medium / Tools Used</label>
            <select
              name="medium"
              value={formData.medium}
              onChange={handleInputChange}
              className={styles.selectField}
            >
              {predefinedMediums.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Artist Note / Story</label>
            <textarea name="artist_note" value={formData.artist_note} onChange={handleInputChange} className={styles.textareaField} placeholder="Tell the viewers the story behind this masterpiece..." />
          </div>

          {status.message && (
            <p className={status.type === 'success' ? styles.successMsg : styles.errorMsg}>
              {status.message}
            </p>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Publishing Masterpiece...' : 'Publish Artwork'}
          </button>

        </form>
      </div>
    </div>
  );
}

