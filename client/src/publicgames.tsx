import React, { useState } from 'react';

unction PublicGamesList({ onJoin }) {
    const [search, setSearch] = useState('');
  
    const filteredGames = publicGamesData.filter(game =>
      game.id.toLowerCase().includes(search.toLowerCase())
    );
  
    return (
      <div className="public-games-section">
        <h2>Public Games</h2>
        <input
          type="text"
          placeholder="Search by code"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <ul>
          {filteredGames.map(game => (
            <li key={game.id}>
              Table <strong>{game.id}</strong> ({game.players}/{game.maxPlayers} players)
              <button onClick={() => onJoin(game.id)}>Join</button>
            </li>
          ))}
          {filteredGames.length === 0 && <li>No games found.</li>}
        </ul>
      </div>
    );
  }
  
  export default PublicGamesList;