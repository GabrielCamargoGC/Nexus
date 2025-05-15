import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [cryptos, setCryptos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Buscar lista de moedas e favoritos
    const fetchData = async () => {
      try {
        const res = await axios.get('https://api.coingecko.com/api/v3/coins/list');
        const favRes = await axios.get('http://localhost:3001/favorites');
        setCryptos(res.data); // reduz a quantidade para não pesar
        setFavorites(favRes.data.map(f => f.crypto));
      } catch (err) {
        setError('Erro ao carregar as criptomoedas e favoritos');
      }
    };
    fetchData();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get('http://localhost:3001/history');
      setHistory(res.data);
    } catch (err) {
      setError('Erro ao carregar o histórico de conversões');
    }
  };

  const handleConvert = async () => {
    if (!selected || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Por favor, insira uma quantidade válida');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/convert', {
        crypto: selected,
        amount: parseFloat(amount),
      });
      
      // Corrigir a forma de acessar os valores
      const { brlValue, usdValue } = res.data;  // Desestruturando a resposta
      setResult({ brlValue, usdValue });  // Atualizando o estado com os valores

      loadHistory();
      setError(''); // Limpar erros anteriores
    } catch (err) {
      setError('Erro na conversão');
    }
    setLoading(false);
  };

  const toggleFavorite = async (crypto) => {
    try {
      await axios.post('http://localhost:3001/favorites', { crypto });
      const favRes = await axios.get('http://localhost:3001/favorites');
      setFavorites(favRes.data.map(f => f.crypto));
    } catch (err) {
      setError('Erro ao adicionar/remover favorito');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Conversor de Criptomoedas</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Exibe erros */}
      
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Selecione</option>
        {cryptos.map((c) => (
          <option key={c.id} value={c.id}>
            {favorites.includes(c.id) ? '⭐ ' : ''}{c.name}
          </option>
        ))}
      </select>
      <button onClick={() => toggleFavorite(selected)}>⭐</button>
      <input
        type="number"
        placeholder="Quantidade"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleConvert} disabled={loading}>
        {loading ? 'Convertendo...' : 'Converter'}
      </button>

      {result && (
        <div>
          <p>Resultado em BRL: R$ {result.brlValue.toFixed(2)}</p>
          <p>Resultado em USD: $ {result.usdValue.toFixed(2)}</p>
        </div>
      )}

      <h3>Histórico de Conversões</h3>
      <ul>
        {history.length > 0 ? (
          history.map((h) => (
            <li key={h.id}>
              {h.amount} {h.currency.toUpperCase()} → R$ {h.brlValue.toFixed(2)} / $
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
