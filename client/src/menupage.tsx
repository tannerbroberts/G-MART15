import React, { useState } from 'react';
import './loginpage.css';
import fannedcards from './fannedcards.png';

const menuPage = () => {
    return (
      <>
        <div className="textcontainer">
          <h1>BLACKJACK</h1>
        </div>
        <button className="menubutton" onClick={() => { /* new game set up code */ }}>
            New Game
        </button>
        <button className="menubutton" onClick={() => { /* join game set up code */ }}>
            Join Game
        </button>
        <button className="menubutton" onClick={() => { /* profile code */ }}>
            Profile
        </button>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
      </>
    );
  };

export default menuPage;