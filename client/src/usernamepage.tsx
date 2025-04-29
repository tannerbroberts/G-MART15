import { useState } from 'react';
import './textboxpages.css';
import fannedcards from './fannedcards.png';

const UsernamePage = () => {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle username submission
        console.log('Username submitted:', username);
    };

    return (
        <>
        <div className='formFormattingWrapper'>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    minLength={4}
                    maxLength={20}
                    placeholder="Choose your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            </div>
            <img src={fannedcards} alt="Image of fanned out cards" className="fannedcardsimage" />
        </>
    );
};

export default UsernamePage;