import React, { useState } from "react";
import axios from "axios";

function CurrencyConverter() {
  const [amount, setAmount] = useState(1); // Quantidade de moeda que o usuário deseja converter
  const [fromCurrency, setFromCurrency] = useState("USD"); // Moeda de origem
  const [toCurrency, setToCurrency] = useState("BRL"); // Moeda de destino
  const [convertedAmount, setConvertedAmount] = useState(null); // Resultado da conversão
  const [loading, setLoading] = useState(false); // Indicador de carregamento
  const [error, setError] = useState(null); // Erro de requisição, se houver

  const handleConvert = async () => {
    setLoading(true);
    setError(null);

    try {
      // Aqui, substitua pela URL do seu backend que faz a conversão
      const response = await axios.get(
        `http://localhost:5000/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`
      );

      // Supondo que a resposta tenha a propriedade "convertedAmount"
      setConvertedAmount(response.data.convertedAmount);
    } catch (err) {
      setError("Erro ao realizar a conversão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Conversor de Criptomoedas</h1>
      <div>
        <label>
          Quantidade:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
          />
        </label>
      </div>
      <div>
        <label>
          Moeda de origem:
          <input
            type="text"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Moeda de destino:
          <input
            type="text"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleConvert} disabled={loading}>
        {loading ? "Carregando..." : "Converter"}
      </button>

      {error && <div style={{ color: "red" }}>{error}</div>}

      {convertedAmount !== null && (
        <div>
          <h2>Resultado:</h2>
          <p>
            {amount} {fromCurrency} = {convertedAmount} {toCurrency}
          </p>
        </div>
      )}
    </div>
  );
}

export default CurrencyConverter;
