'use client';
export const dynamic = 'force-dynamic';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SubmitContent() {
  const router = useRouter();
  const params = useParams();
  const category = params.category; // 'physical' or 'cyber'

  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form fields
  const [abuserName, setAbuserName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [abuseType, setAbuseType] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Abuse type options based on category
  const physicalTypes = ['workplace', 'domestic', 'public space', 'stalking', 'physical assault', 'sexual harassment', 'other'];
  const cyberTypes = ['social media threats', 'Instagram DMs', 'WhatsApp harassment', 'email abuse', 'online stalking', 'revenge porn', 'other'];
  
  const abuseTypes = category === 'cyber' ? cyberTypes : physicalTypes;

  useEffect(() => {
    // Redirect if no category selected
    if (!category || (category !== 'physical' && category !== 'cyber')) {
      router.push('/choose-category');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load user profile
        const profileDoc = await getDoc(doc(db, 'profiles', currentUser.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data());
        }
      } else {
        router.push('/signup');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Validation
      if (!abuserName || !city || !state || !abuseType || !description) {
        setError('Please fill in all fields');
        setSubmitting(false);
        return;
      }

      if (description.length < 50) {
        setError('Description must be at least 50 characters');
        setSubmitting(false);
        return;
      }

      // Create post
        let imageUrl = null;

        if (image) {
          try {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', 'gsvknkkb');
            formData.append('cloud_name', 'dtwu9crns');

            const res = await fetch(
              'https://api.cloudinary.com/v1_1/dtwu9crns/image/upload',
              {
                method: 'POST',
                body: formData,
              }
            );

            const data = await res.json();

            if (!data.secure_url) {
              throw new Error("Image upload failed");
            }

            imageUrl = data.secure_url;

          } catch (err) {
            console.log("Image upload failed:", err);
            // optional: continue without image instead of failing everything
          }
        }

        // ✅ Save to Firestore
        await addDoc(collection(db, 'posts'), {
        abuserName,
        city,
        state,
        abuseType,
        category,
        description,
        isAnonymous,
        posterName: isAnonymous ? null : userProfile?.displayName || 'Anonymous',
        userId: user.uid,
        createdAt: new Date(),
        isApproved: true,
        imageUrl: imageUrl, // 👈 ADD THIS
        });
      setSuccess(true);
      // Redirect to homepage after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Error submitting post:', err);
      setError('Failed to submit your story. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#B09080', fontSize: '14px' }}>loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 500, color: '#3D2216', marginBottom: '0.5rem' }}>
            your story has been shared
          </div>
          <div style={{ fontSize: '13px', color: '#8C6B5A' }}>
            redirecting you to the homepage...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ background: '#FAF7F2', borderBottom: '0.5px solid #E8E0D5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <div style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '30px', fontWeight: 500, color: '#7A3F2B', lineHeight: 1.1 }}>awaaz</div>
            <div style={{ fontSize: '15px', color: '#B09080', letterSpacing: '0.2px' }}>your voice deserves to be heard</div>
          </div>
        </Link>
        <Link href="/choose-category">
          <button style={{ background: 'transparent', color: '#7A3F2B', border: '0.5px solid #DDD0C4', borderRadius: '20px', padding: '6px 16px', fontSize: '15px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
            back
          </button>
        </Link>
      </nav>

      {/* Submit Form */}
      <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '0 2rem' }}>
        <div style={{ background: '#FFFCF9', border: '0.5px solid #E8E0D5', borderRadius: '14px', padding: '2rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#3D2216', marginBottom: '0.5rem' }}>
            share your story — {category === 'cyber' ? 'cyber crime' : 'physical abuse'}
          </h2>
          <p style={{ fontSize: '13px', color: '#8C6B5A', marginBottom: '1.5rem' }}>
            you are safe here. speak your truth.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Abuser Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                {category === 'cyber' ? "abuser's name / username / handle *" : "abuser's name *"}
              </label>
              <input
                type="text"
                placeholder={category === 'cyber' ? "@username or full name" : "full name or nickname"}
                value={abuserName}
                onChange={(e) => setAbuserName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid #DDD0C4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  color: '#000',
                  backgroundColor: '#fff',
                }}
              />
            </div>

            {/* Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                  city *
                </label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #DDD0C4',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                  state *
                </label>
                <input
                  type="text"
                  placeholder="Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #DDD0C4',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </div>
            </div>

            {/* Abuse Type */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                type of {category === 'cyber' ? 'cyber abuse' : 'abuse'} *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {abuseTypes.map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="abuseType"
                      value={type}
                      checked={abuseType === type}
                      onChange={(e) => setAbuseType(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#3D2216', textTransform: 'capitalize' }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                your story * (minimum 50 characters)
              </label>
              <textarea
                placeholder="share as much or as little as you want. you are believed here."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid #DDD0C4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  color: '#000',
                  backgroundColor: '#fff',
                }}
              />
              <div style={{ fontSize: '11px', color: '#C4A898', marginTop: '4px' }}>
                {description.length} characters
              </div>
            </div>
            {category === 'cyber' && (
            <div style={{ marginBottom: '1rem' }}>
                
                {/* Label */}
                <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500 }}>
                upload screenshot (optional)
                </label>

                {/* Button */}
                <div style={{ marginTop: '8px' }}>
                <label
                    style={{
                    display: 'inline-block',
                    padding: '8px 14px',
                    background: '#7A3F2B',
                    color: '#FAF7F2',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    }}
                >
                    choose file
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    style={{ display: 'none' }} // 👈 hide default input
                    />
                </label>
                </div>

                {/* File name */}
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#8C6B5A' }}>
                {image ? image.name : 'no file chosen yet'}
                </div>

            </div>
            )}

            {/* Anonymous Toggle */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#3D2216' }}>
                  share anonymously {userProfile?.displayName && !isAnonymous && `(will show as ${userProfile.displayName})`}
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ color: '#C85A3A', fontSize: '12px', marginBottom: '1rem', backgroundColor: '#FFF5F0', padding: '10px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#7A3F2B',
                color: '#FAF7F2',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {submitting ? 'sharing your story...' : 'share your story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <SubmitContent />
    </Suspense>
  );
}
