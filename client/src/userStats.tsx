
export function UserStats({ username, totalWinnings, gamesPlayed }) {
    return (
      <div className="user-stats">
        <h1>Welcome, {username}!</h1>
        <p>Total Winnings: ${totalWinnings}</p>
        <p>Games Played: {gamesPlayed}</p>
      </div>
    );
  }

  function GameMenu() {
    return (
      <div className="game-menu">
        <UserStats
          username="Loading..."
          totalWinnings="—"
          gamesPlayed="—"
        />
      </div>
    );
  }
  
  export default GameMenu;