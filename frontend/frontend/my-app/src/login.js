import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? '/register' : '/login';
    try {
      const res = await axios.post(`http://localhost:3001${endpoint}`, {
        username,
        password,
      });

      if (!isRegister) {
        localStorage.setItem('token', res.data.token);
        onLogin(); // Notifica o App
      } else {
        alert('Usuário cadastrado com sucesso! Faça login.');
        setIsRegister(false);
      }

      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao autenticar');
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? 'Registrar' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegister ? 'Registrar' : 'Entrar'}</button>
      </form>
      <button
        type="button"
        className="toggle-btn"
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? 'Já tenho conta' : 'Criar nova conta'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Login;
