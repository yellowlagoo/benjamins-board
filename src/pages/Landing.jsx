import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import frameMet from '../assets/frames/frameMet.png';
import landingGoose from '../assets/landingGoose.png';
import './Landing.css';

const SEARCH_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting';
const OBJECT_URL =
  'https://collectionapi.metmuseum.org/public/collection/v1/objects/';
const CACHE_KEY = 'met-daily-artwork';
const MAX_RETRIES = 5;

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
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

function validateImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

export default function Landing() {
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchArtwork = useCallback(async () => {
    const cached = loadCache();
    if (cached) {
      setArtwork(cached);
      setLoading(false);
      return;
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
        const idx = (dayIndex + attempt) % ids.length;
        const objectID = ids[idx];

        try {
          const objRes = await fetch(OBJECT_URL + objectID);
          const objData = await objRes.json();

          if (objData.primaryImage) {
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
            />
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="landing-artwork-loading">
              <div className="landing-artwork-spinner" />
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
        <div className="landing-text-board">BOARD</div>
      </div>
    </div>
  );
}
