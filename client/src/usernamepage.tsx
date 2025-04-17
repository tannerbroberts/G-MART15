import React, { useState } from 'react';
import './textboxpages.css';
import fannedcards from './fannedcards.png';

const UsernamePage = () => {
    return (
        <>
        <div className='formFormattingWrapper'>
            <form>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    minLength={4}
                    maxLength={20}
                    placeholder="Choose your username"
                />
                <button type="submit">Submit</button>
            </form>
            </div>
            <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
        </>
    );
};

export default UsernamePage;