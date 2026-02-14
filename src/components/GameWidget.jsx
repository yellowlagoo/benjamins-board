import { useState, useEffect } from 'react';
import games from '../games.json';

function getDayIndex() {
  return Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
}

export default function GameWidget({ open, onClose }) {
  const [error, setError] = useState(false);

  const game = games[getDayIndex() % games.length];

  useEffect(() => {
    if (!open) return;
    setError(false);
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="game-modal-backdrop" onClick={onClose}>
      <div className="game-modal" onClick={(e) => e.stopPropagation()}>
        <div className="game-modal-header">
          <span className="game-modal-title">{game.title}</span>
          <button className="game-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        {error ? (
          <div className="game-modal-fallback">
            <p>game unavailable</p>
          </div>
        ) : (
          <iframe
            className="game-modal-iframe"
            src={game.url}
            title={game.title}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; keyboard-map"
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}
