import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Login from './login';
import './App.css';

function App() {
  const [isLogged, setIsLogged] = useState(!!localStorage.getItem('token'));
  const [cryptos, setCryptos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!isLogged) {
      // Limpa dados ao deslogar
      setCryptos([]);
      setFavorites([]);
      setSelected('');
      setAmount('');
      setResult(null);
      setHistory([]);
      setLoading(false);
      setError('');
      return;
    }

    const fetchData = async () => {
      try {
        setError('');
        const [res, favRes, histRes] = await Promise.all([
          axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd'),
          axios.get('http://localhost:3001/favorites', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3001/history', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCryptos(res.data);
        setFavorites(favRes.data.map(f => f.currency));
        setHistory(histRes.data);
      } catch (err) {
        setError('Erro ao carregar dados do usuário.');
      }
    };

    fetchData();
  }, [isLogged, token]);

  const handleConvert = async () => {
    if (!selected || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Por favor, insira uma quantidade válida');
      return;
    }

    setLoading(true);
    try {
      setError('');
      const res = await axios.post(
        'http://localhost:3001/convert',
        { crypto: selected, amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { brlValue, usdValue } = res.data;
      setResult({ brlValue, usdValue });

      const histRes = await axios.get('http://localhost:3001/history', { headers: { Authorization: `Bearer ${token}` } });
      setHistory(histRes.data);
    } catch (err) {
      setError('Erro na conversão');
    }
    setLoading(false);
  };

  const toggleFavorite = async (crypto) => {
    if (!crypto) return;
    try {
      setError('');
      await axios.post(
        'http://localhost:3001/favorites',
        { crypto },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const favRes = await axios.get('http://localhost:3001/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(favRes.data.map(f => f.currency));
    } catch (err) {
      setError('Erro ao atualizar favoritos');
    }
  };

  const handleLogin = () => {
    // Reseta estados e seta isLogged
    setCryptos([]);
    setFavorites([]);
    setSelected('');
    setAmount('');
    setResult(null);
    setHistory([]);
    setError('');
    setIsLogged(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLogged(false);

    // Limpa estados para evitar mostrar dados da sessão anterior
    setCryptos([]);
    setFavorites([]);
    setSelected('');
    setAmount('');
    setResult(null);
    setHistory([]);
    setLoading(false);
    setError('');
  };

  if (!isLogged) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <h2>Conversor de Criptomoedas</h2>
      <button onClick={logout}>Sair</button>

      {error && <div className="error-message">{error}</div>}

      {/* Favoritos */}
      <section style={{ marginTop: '20px' }}>
        <h3>Favoritos ⭐</h3>
        {favorites.length === 0 ? (
          <p style={{ fontStyle: 'italic' }}>Nenhuma moeda favoritada ainda.</p>
        ) : (
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: 0 }}>
            {favorites.map((favId) => {
              const crypto = cryptos.find((c) => c.id === favId);
              if (!crypto) return null;
              return (
                <li
                  key={favId}
                  style={{
                    backgroundColor: '#ff3b3f22',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: '#ff3b3f',
                    fontWeight: '600',
                    minWidth: '100px',
                    textAlign: 'center',
                    transition: 'background-color 0.3s ease',
                  }}
                  onClick={() => setSelected(favId)}
                  title={`Selecionar ${crypto.name}`}
                >
                  ⭐ {crypto.name}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Seleção + Favoritar */}
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Selecione a criptomoeda"
        >
          <option value="">Selecione</option>
          {cryptos.map((c) => (
            <option key={c.id} value={c.id}>
              {favorites.includes(c.id) ? '⭐ ' : ''}
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={() => toggleFavorite(selected)} disabled={!selected}>
          {favorites.includes(selected) ? 'Remover ⭐' : 'Adicionar ⭐'}
        </button>
      </div>

      {/* Quantidade + Converter */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center' }}>
        <input
          type="number"
          placeholder="Quantidade"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Quantidade"
          min="0"
        />
        <button onClick={handleConvert} disabled={loading}>
          {loading ? 'Convertendo...' : 'Converter'}
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="result-container" aria-live="polite">
          <p>
            Resultado em BRL:{' '}
            {result.brlValue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
          <p>
            Resultado em USD:{' '}
            {result.usdValue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
          </p>
        </div>
      )}

      {/* Histórico */}
      <h3>Histórico de Conversões</h3>
      <ul>
        {history.length > 0 ? (
          history.map((h) => (
            <li key={h.id}>
              {h.amount} {h.currency.toUpperCase()} → R${' '}
              {h.brlValue.toFixed(2)} / ${' '}
              {h.usdValue.toFixed(2)}
            </li>
          ))
        ) : (
          <li>Nenhuma conversão realizada ainda.</li>
        )}
      </ul>
    </div>
  );
}

export default App;
