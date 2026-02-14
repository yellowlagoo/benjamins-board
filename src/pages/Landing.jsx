import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import frameMet from '../assets/frames/frameMet.png';
import landingGoose from '../assets/landingGoose.png';
import './Landing.css';

const SEARCH_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting';
const OBJECT_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
const CACHE_KEY = 'met-daily-artwork-v2';
const MAX_RETRIES = 10;
const RETRY_STRIDE = 7919; // large prime to spread retries across the array

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayIndex() {
  return Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.date === getTodayString() && cached.artwork) return cached.artwork;
  } catch {}
  return null;
}

function saveCache(artwork) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date: getTodayString(), artwork })
    );
  } catch {}
}

// The Met CDN serves generic placeholder JPEGs (e.g. "image-number-only.jpg")
// for objects without a real photograph. These are valid images but show
// "consult primary record" text instead of artwork.
const PLACEHOLDER_NAMES = ['image-number-only', 'no-image', 'placeholder'];

function isPlaceholderUrl(url) {
  const filename = url.split('/').pop().toLowerCase();
  return PLACEHOLDER_NAMES.some((name) => filename.includes(name));
}

function validateImage(url) {
  if (isPlaceholderUrl(url)) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth >= 200 && img.naturalHeight >= 200);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export default function Landing() {
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchArtwork = useCallback(async () => {
    const cached = loadCache();
    if (cached) {
      const stillValid = await validateImage(cached.primaryImage);
      if (stillValid) {
        setArtwork(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const searchRes = await fetch(SEARCH_URL);
      const searchData = await searchRes.json();
      const ids = searchData.objectIDs;
      if (!ids || ids.length === 0) {
        setLoading(false);
        return;
      }

      const dayIndex = getDayIndex();

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const idx = (dayIndex + attempt * RETRY_STRIDE) % ids.length;
        const objectID = ids[idx];

        try {
          const objRes = await fetch(OBJECT_URL + objectID);
          const objData = await objRes.json();

          if (objData.primaryImage && objData.isPublicDomain) {
            const valid = await validateImage(objData.primaryImage);
            if (valid) {
              const artworkData = {
                title: objData.title || '',
                artistDisplayName: objData.artistDisplayName || '',
                artistDisplayBio: objData.artistDisplayBio || '',
                objectDate: objData.objectDate || '',
                medium: objData.medium || '',
                department: objData.department || '',
                creditLine: objData.creditLine || '',
                accessionYear: objData.accessionYear || '',
                primaryImage: objData.primaryImage,
              };
              saveCache(artworkData);
              setArtwork(artworkData);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }
    } catch {}

    setFailed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArtwork();
  }, [fetchArtwork]);

  const infoRows = artwork
    ? [
        { label: 'Title', value: artwork.title, isTitle: true },
        { label: 'Artist', value: artwork.artistDisplayName },
        { label: '', value: artwork.artistDisplayBio },
        { label: 'Date', value: artwork.objectDate },
        { label: 'Medium', value: artwork.medium },
        { label: 'Department', value: artwork.department },
        { label: 'Credit', value: artwork.creditLine },
        { label: 'Accession', value: artwork.accessionYear },
      ].filter((r) => r.value)
    : [];

  return (
    <div className="landing" onClick={() => navigate('/dashboard')}>
      <div className="landing-images">
        {/* Frame container with artwork inside */}
        <div className="landing-frame-container">
          {/* Artwork image — behind the frame */}
          {artwork && (
            <img
              src={artwork.primaryImage}
              alt={artwork.title}
              className={`landing-artwork-img ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setArtwork(null);
                setFailed(true);
              }}
            />
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="landing-artwork-loading">
              <div className="landing-artwork-spinner" />
            </div>
          )}

          {/* Fallback when artwork unavailable */}
          {failed && !artwork && (
            <div className="landing-artwork-fallback">
              <span className="landing-artwork-fallback-text">
                no artwork today
              </span>
            </div>
          )}

          {/* Hover overlay with artwork info */}
          {artwork && imageLoaded && (
            <div
              className="landing-artwork-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="landing-artwork-info">
                {infoRows.map((row, i) => (
                  <div
                    key={i}
                    className={
                      row.isTitle
                        ? 'landing-artwork-info-title'
                        : row.label
                          ? 'landing-artwork-info-row'
                          : 'landing-artwork-info-bio'
                    }
                  >
                    {row.label && !row.isTitle && (
                      <span className="landing-artwork-info-label">
                        {row.label}
                      </span>
                    )}
                    <span
                      className={
                        row.isTitle
                          ? 'landing-artwork-info-title-text'
                          : 'landing-artwork-info-value'
                      }
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Frame image — on top, overlapping artwork edges */}
          <img src={frameMet} alt="" className="landing-frame-img" />
        </div>

        <img src={landingGoose} alt="" className="landing-goose-img" />
      </div>

      <div className="landing-text">
        <div className="landing-text-benjamins">Benjamin's</div>
        <div className="landing-text-board">Board</div>
      </div>
    </div>
  );
}
