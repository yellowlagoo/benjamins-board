import cherryBlossom from '../assets/cherryBlossom.png';
import frameLoveNote from '../assets/frames/frameLoveNote.png';
import frameWeather from '../assets/frames/frameWeather.png';
import frameGame from '../assets/frames/frameGame.png';
import framePic from '../assets/frames/framePic.png';
import './Dashboard.css';

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

  return (
    <div className="dashboard">
      {/* Cherry blossom decoration */}
      <img
        src={cherryBlossom}
        alt=""
        className="dashboard-blossom"
        aria-hidden="true"
      />

      {/* Date heading */}
      <h1 className="dashboard-date">{today}</h1>

      {/* Gallery wall */}
      <div className="gallery">
        {/* Love Note — top left, large */}
        <div className="tile tile-lovenote">
          <div className="tile-frame-wrapper">
            <img src={frameLoveNote} alt="" className="tile-frame" />
            <div className="tile-content">
              <p className="tile-label tile-label-script">love note</p>
            </div>
          </div>
        </div>

        {/* Game — bottom left, wide horizontal */}
        <div className="tile tile-game">
          <div className="tile-frame-wrapper">
            <img src={frameGame} alt="" className="tile-frame" />
            <div className="tile-content">
              <p className="tile-label tile-label-script">game</p>
            </div>
          </div>
        </div>

        {/* Weather — bottom center, tall */}
        <div className="tile tile-weather">
          <div className="tile-frame-wrapper">
            <img src={frameWeather} alt="" className="tile-frame" />
            <div className="tile-content tile-content-weather">
              <p className="weather-title">Weather</p>
              <p className="weather-temp">H:7 L:0</p>
              <p className="weather-message">
                w e a r&nbsp;&nbsp;a<br />
                j a c k e t<br />
                m y&nbsp;&nbsp;l o v e
              </p>
            </div>
          </div>
        </div>

        {/* Pic of us — right side, square */}
        <div className="tile tile-pic">
          <div className="tile-frame-wrapper">
            <img src={framePic} alt="" className="tile-frame" />
            <div className="tile-content">
              <p className="tile-label tile-label-script tile-label-pic">
                pic of us
              </p>
            </div>
          </div>
          <p className="tile-caption">
            Us in<br />
            H M B
          </p>
        </div>
      </div>
    </div>
  );
}
