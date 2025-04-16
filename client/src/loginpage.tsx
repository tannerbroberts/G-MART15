import './LoginPage.css';

const LoginPage = () => {
    return (
      <div className="container">
              <div className="textcontainer">
        <p>G-MART PRESENTS</p>
        <h1>BLACKJACK</h1>
      </div>
        <button className="loginbutton" onClick={() => { /* google login code */ }}>
            Log In With Google
        </button>
      </div>
    );
  };

export default LoginPage;