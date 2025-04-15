import { useState } from 'react'
import './App.css'
import LoginPage from './LoginPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='appcontainer'>
      <LoginPage />
    </div>
  );
}

export default App;