import { useNavigate } from 'react-router-dom';
import frameMet from '../assets/frames/frameMet.png';
import landingGoose from '../assets/landingGoose.png';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing" onClick={() => navigate('/dashboard')}>
      <div className="landing-content">
        <div className="landing-frame">
          <div className="landing-frame-wrapper">
            <img src={frameMet} alt="" className="landing-frame-img" />
            <div className="landing-frame-inner">
              <div className="landing-frame-flowers" />
            </div>
          </div>
        </div>

        <div className="landing-title-area">
          <img
            src={landingGoose}
            alt="Benjamin's Board"
            className="landing-goose-img"
          />
        </div>
      </div>

      <p className="landing-enter">click anywhere to enter</p>
    </div>
  );
}
