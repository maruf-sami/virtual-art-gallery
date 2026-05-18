"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'
import styles from './upload.module.css';
import { useRouter } from 'next/navigation';

export default function UploadArtworkPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    category: 'Abstract',
    dimension: '',
    medium: '',
    artist_note: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

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

    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist_name', formData.artist_name);
    data.append('category', formData.category);
    data.append('dimension', formData.dimension);
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

        setFormData({ title: '', artist_name: '', category: 'Abstract', dimension: '', medium: '', artist_note: '' });
        setImageFile(null);
        setFileName('');

        setTimeout(() => {
          router.push("/gallery")
        }, 140)
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

  const tempUser = { isLoggedIn: false, name: 'Guest' };

  return (
    <div className={styles.uploadContainer}>

      <div className={styles.formWrapper}>
        <h1 className={styles.pageTitle}>Exhibit Your Artwork</h1>

        <form onSubmit={handleSubmit} className={styles.uploadForm}>

          <div className={styles.inputGroup}>
            <label>Artwork File</label>
            <div className={styles.fileInputWrapper} onClick={() => document.getElementById('artFileInput').click()}>
              <p>{fileName ? `Selected: ${fileName}` : 'Drag & Drop or Click to Upload Image (JPG, PNG)'}</p>
              <input
                id="artFileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Artwork Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className={styles.inputField} placeholder="e.g., The Golden Cipher" />
          </div>

          <div className={styles.inputGroup}>
            <label>Artist Name</label>
            <input type="text" name="artist_name" value={formData.artist_name} onChange={handleInputChange} required className={styles.inputField} placeholder="e.g., Alex Vanguard" />
          </div>

          <div className={styles.inputGroup}>
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className={styles.selectField}>
              <option value="Abstract">Abstract</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Classical Painting">Classical Painting</option>
              <option value="Sculpture">Sculpture</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label>Dimensions</label>
            <input type="text" name="dimension" value={formData.dimension} onChange={handleInputChange} required className={styles.inputField} />
          </div>

          <div className={styles.inputGroup}>
            <label>Medium / Tools Used</label>
            <input type="text" name="medium" value={formData.medium} onChange={handleInputChange} required className={styles.inputField} placeholder="e.g., Oil on Canvas, Photoshop, Blender" />
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
            {loading ? 'uploading...' : 'Publish Artwork'}
          </button>

        </form>
      </div>
    </div>
  );
}
