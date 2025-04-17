import { useState } from 'react'
import './App.css'
import LoginPage from './LoginPage';
import MenuPage from './MenuPage';
import UsernamePage from './usernamepage';
import JoinGamePage from './joingamepage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='appcontainer'>
      <LoginPage />
    </div>
  );
}

export default App;