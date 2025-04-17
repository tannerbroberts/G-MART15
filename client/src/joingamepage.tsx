import React, { useState } from 'react';
import './textboxpages.css';
import fannedcards from './fannedcards.png';


const JoinGamePage = () => {
    return (
    <>
    <div className='formFormattingWrapper'>
        <form>
        <label htmlFor="code">Code:</label>
                <input
                    type="text"
                    id="code"
                    name="code"
                    required
                    minLength={5} /* NEED TO ADJUST FOR ACTUAL CODE LENGTH */
                    maxLength={5}
                    placeholder="Enter game code"
                />
            <button type="submit">Submit</button>
        </form>
        </div>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
    </>
);
};

export default JoinGamePage;