import cherryBlossom from '../assets/cherryBlossom.png';
import frameLoveNote from '../assets/frames/frameLoveNote.png';
import frameWeather from '../assets/frames/frameWeather.png';
import frameGame from '../assets/frames/frameGame.png';
import framePic from '../assets/frames/framePic.png';
import { useState } from 'react';
import WeatherWidget from '../components/WeatherWidget';
import GameWidget from '../components/GameWidget';
import './Dashboard.css';
import gameGif from '../assets/penguin.gif';
import LoveNoteWidget from '../components/LoveNoteWidget';
import useDailyPic from '../components/PicWidget';

function getFormattedDate() {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;
}

export default function Dashboard() {
  const today = getFormattedDate();
  const [gameOpen, setGameOpen] = useState(false);
  const { photo, caption } = useDailyPic();

  return (
    <div className="dashboard">
      {/* Date heading */}
      <h1 className="dashboard-date">{today}</h1>

      {/* Cherry blossom decoration */}
      <img
        src={cherryBlossom}
        alt=""
        className="dashboard-blossom"
        aria-hidden="true"
      />

      {/* Love Note — top left */}
      <div className="tile tile-lovenote">
        <div className="tile-frame-wrapper">
          <img src={frameLoveNote} alt="" className="tile-frame" />
          <div className="tile-content title-content-lovenote">
            <LoveNoteWidget />
          </div>
        </div>
      </div>


      {/* Game — bottom left */}
      <div
        className="tile tile-game"
        onClick={() => setGameOpen(true)}
      >
        <div className="tile-frame-wrapper">
          <img src={frameGame} alt="" className="tile-frame" />
          <div className="tile-content tile-content-game">
            <img src={gameGif} alt="" className="game-penguin-img" />
            <p className="tile-label tile-label-script game-label"></p>
          </div>
        </div>
      </div>

      {/* Weather — center */}
      <div className="tile tile-weather">
        <div className="tile-frame-wrapper">
          <img src={frameWeather} alt="" className="tile-frame" />
          <div className="tile-content tile-content-weather">
            <WeatherWidget />
          </div>
        </div>
      </div>

      {/* Pic of us — top left */}
      <div className="tile tile-pic">
        <div className="tile-frame-wrapper">
          <img src={framePic} alt="" className="tile-frame" />
          <div className="tile-content tile-content-pic">
            {photo && <img src={photo} alt={caption} className="pic-widget-photo" />}
          </div>
        </div>
        {caption && (
          <p className="pic-widget-caption">{caption}</p>
        )}
      </div>

      <GameWidget open={gameOpen} onClose={() => setGameOpen(false)} />
    </div>
  );
}
