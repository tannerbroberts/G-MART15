import './loginpage.css';
import fannedcards from './fannedcards.png';

import './LoginPage.css';

const LoginPage = () => {
    return (
      <>
              <div className="textcontainer">
        <p>G-MART PRESENTS</p>
        <h1>BLACKJACK</h1>
      </div>
        <button className="loginbutton" onClick={() => { /* google login code */ }}>
            Log In With Google
        </button>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
      </>
    );
  };

export default LoginPage;