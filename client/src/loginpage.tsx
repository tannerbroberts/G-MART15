import './loginpage.css';
import fannedcards from './fannedcards.png';

import './LoginPage.css';
import useSound from 'use-sound';
import testButtonSfx from '/src/assets/sound_assets/PlaceholderButtonNoise.mp3'




const LoginPage = () => {
const [playActive] = useSound(testButtonSfx,  
  {volume: 0.5})

    return (
      <>
              <div className="textcontainer">
        <p>G-MART PRESENTS</p>
        <h1>BLACKJACK</h1>
      </div>
        <button className="loginbutton" onClick={
          playActive}>
            Log In With Google
        </button>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
      </>
    );
  };

export default LoginPage;