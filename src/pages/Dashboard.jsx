import cherryBlossom from '../assets/cherryBlossom.png';
import frameLoveNote from '../assets/frames/frameLoveNote.png';
import frameWeather from '../assets/frames/frameWeather.png';
import frameGame from '../assets/frames/frameGame.png';
import framePic from '../assets/frames/framePic.png';
import WeatherWidget from '../components/WeatherWidget';
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
          <div className="tile-content">
            <p className="tile-label tile-label-script">love note</p>
          </div>
        </div>
      </div>

      {/* Game — bottom left */}
      <div className="tile tile-game">
        <div className="tile-frame-wrapper">
          <img src={frameGame} alt="" className="tile-frame" />
          <div className="tile-content">
            <p className="tile-label tile-label-script">game</p>
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

      {/* Pic of us — right side upper */}
      <div className="tile tile-pic">
        <div className="tile-frame-wrapper">
          <img src={framePic} alt="" className="tile-frame" />
          <div className="tile-content">
            <p className="tile-label tile-label-script tile-label-pic">
              pic of us
            </p>
          </div>
        </div>
      </div>

      {/* Us in HMB — caption below pic of us */}
      <p className="dashboard-caption-hmb">
        Us in<br />
        HMB
      </p>
    </div>
  );
}
