import { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function App() {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const isRegister = view === 'register';

  function clearForm() {
    setUsername('');
    setEmail('');
    setPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const path = isRegister ? '/register' : '/login';
      const body = isRegister ? { username, email, password } : { username, password };

      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        return;
      }

      clearForm();

      if (isRegister) {
        setMessage(data.message);
        setView('login');
      } else {
        setUsername(data.username);
        setMessage(data.message);
        setView('dashboard');
      }
    } catch {
      setError('Could not connect to the server');
    }
  }

  function logout() {
    setUsername('');
    setMessage('');
    setError('');
    clearForm();
    setView('login');
  }

  function switchView(nextView) {
    setError('');
    setMessage('');
    clearForm();
    setView(nextView);
  }

  return (
    <main className="app">
      <section>
        <h1>Practice App</h1>
        <p>Simple register, login, and dashboard flow.</p>

        {view === 'dashboard' ? (
          <>
            <h2>Dashboard</h2>
            <p>Logged in as {username || 'user'}.</p>
            <p>{message || 'Loading dashboard...'}</p>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            {message && <p>{message}</p>}
            {error && <p className="error-text">{error}</p>}

            <form className="form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />

              {isRegister && (
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              )}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button type="submit">
                {isRegister ? 'Register' : 'Login'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => switchView(isRegister ? 'login' : 'register')}
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
