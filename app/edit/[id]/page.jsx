'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams, useRouter } from 'next/navigation';

export default function EditPage() {

  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);

  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 🔐 Auth check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsub();
  }, [router]);

  // 📥 Load post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setError('Post not found');
          setLoading(false);
          return;
        }

        const data = snap.data();

        // Security check
        if (data.userId !== auth.currentUser?.uid) {
          setError('You cannot edit this post');
          setLoading(false);
          return;
        }

        setPost(data);
        setDescription(data.description);

      } catch (err) {
        console.error(err);
        setError('Failed to load post');
      }

      setLoading(false);
    };

    if (id) fetchPost();
  }, [id]);

  // 💾 Save
  const handleUpdate = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {

      if (!description || description.length < 50) {
        setError('Description must be at least 50 characters');
        setSaving(false);
        return;
      }

      await updateDoc(doc(db, 'posts', id), {
        description,
        updatedAt: new Date(),
      });

      router.push('/');

    } catch (err) {
      console.error(err);
      setError('Failed to update post');
    }

    setSaving(false);
  };

  // 🗑 Delete
  const handleDelete = async () => {

    const confirmDelete = confirm(
      'Are you sure you want to permanently delete this story?'
    );

    if (!confirmDelete) return;

    try {

      await deleteDoc(doc(db, 'posts', id));

      router.push('/');

    } catch (err) {
      console.error(err);
      setError('Failed to delete post');
    }
  };

  // Loading
  if (loading) {
    return (
      <div
        style={{
          background: '#FAF7F2',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7A3F2B',
        }}
      >
        loading...
      </div>
    );
  }

  // Error
  if (error && !post) {
    return (
      <div
        style={{
          background: '#FAF7F2',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#FAF7F2',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >

      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#FFFCF9',
          borderRadius: '18px',
          padding: '2.5rem',
          border: '1px solid #E8E0D5',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >

        <h1
          style={{
            fontSize: '28px',
            color: '#3D2216',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}
        >
          edit your story
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#8C6B5A',
            marginBottom: '2rem',
            fontSize: '14px',
          }}
        >
          you can only edit the story content
        </p>

        <form onSubmit={handleUpdate}>

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '14px',
              border: '1px solid #DDD0C4',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#000',
              background: '#FFF',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <div
            style={{
              marginTop: '8px',
              color: '#B09080',
              fontSize: '12px',
            }}
          >
            {description.length} characters
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: '1rem',
                background: '#FFF1ED',
                color: '#C85A3A',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '2rem',
              flexWrap: 'wrap',
            }}
          >

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              style={{
                background: '#7A3F2B',
                color: '#FAF7F2',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.03)';
                e.target.style.opacity = '0.9';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              {saving ? 'saving...' : 'save changes'}
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                border: '1px solid #7A3F2B',
                color: '#7A3F2B',
                padding: '12px 22px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#7A3F2B';
                e.target.style.color = '#FAF7F2';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#7A3F2B';
              }}
            >
              cancel
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              style={{
                background: '#C85A3A',
                color: '#fff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                marginLeft:'200px',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.03)';
                e.target.style.opacity = '0.9';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.opacity = '1';
              }}
            >
              discard story
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}