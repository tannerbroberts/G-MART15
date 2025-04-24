import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './textboxpages.css';
import fannedcards from './fannedcards.png';

const JoinGamePage = () => {
    const navigate = useNavigate();
    const [gameCode, setGameCode] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle game join logic here
        console.log('Joining game:', gameCode);
        navigate('/game');
    };

    return (
        <>
        <div className='formFormattingWrapper'>
            <form onSubmit={handleSubmit}>
                <label htmlFor="code">Code:</label>
                <input
                    type="text"
                    id="code"
                    name="code"
                    required
                    minLength={5}
                    maxLength={5}
                    placeholder="Enter game code"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
        <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
        </>
    );
};

export default JoinGamePage;