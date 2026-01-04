// src/front/components/Dashboard/components/WeatherWidget.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaCloud, FaTemperatureHigh, FaWind, FaMapMarkerAlt, FaTint } from 'react-icons/fa';
import './WeatherWidget.css';

const WeatherWidget = ({ city, latitude, longitude }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeatherIcon = (weatherCode) => {
    // Códigos del clima de Open-Meteo
    const weatherIcons = {
      0: '☀️', // Despejado
      1: '🌤️', // Mayormente despejado
      2: '⛅', // Parcialmente nublado
      3: '☁️', // Nublado
      45: '🌫️', // Niebla
      48: '🌫️', // Niebla escarcha
      51: '🌦️', // Llovizna ligera
      53: '🌧️', // Llovizna moderada
      55: '🌧️', // Llovizna densa
      56: '🌨️', // Nieve ligera
      57: '🌨️', // Nieve moderada
      61: '🌧️', // Lluvia ligera
      63: '🌧️', // Lluvia moderada
      65: '🌧️', // Lluvia fuerte
      66: '🌨️', // Nieve ligera
      67: '🌨️', // Nieve moderada
      71: '🌨️', // Nevada ligera
      73: '🌨️', // Nevada moderada
      75: '🌨️', // Nevada fuerte
      80: '🌦️', // Chubascos ligeros
      81: '🌦️', // Chubascos moderados
      82: '🌦️', // Chubascos violentos
      95: '⛈️', // Tormenta ligera
      96: '⛈️', // Tormenta moderada
      99: '⛈️', // Tormenta fuerte
    };
    return weatherIcons[weatherCode] || '🌤️';
  };

  const getWeatherDescription = (weatherCode) => {
    const descriptions = {
      0: 'Despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla con escarcha',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna densa',
      56: 'Nieve ligera',
      57: 'Nieve moderada',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia fuerte',
      66: 'Nieve ligera',
      67: 'Nieve moderada',
      71: 'Nevada ligera',
      73: 'Nevada moderada',
      75: 'Nevada fuerte',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos violentos',
      95: 'Tormenta ligera',
      96: 'Tormenta moderada',
      99: 'Tormenta fuerte',
    };
    return descriptions[weatherCode] || 'Desconocido';
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!city && (!latitude || !longitude)) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        let url;

        if (city) {
          url = `http://127.0.0.1:3001/api/weather/${city}`;
        } else if (latitude && longitude) {
          const response = await fetch('http://127.0.0.1:3001/api/weather/coordinates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latitude, longitude })
          });
          const data = await response.json();
          setWeather(data);
          setLoading(false);
          return;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError('Error al obtener el clima');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city, latitude, longitude]);

  if (loading) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando clima...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mb-3">
        {error}
      </Alert>
    );
  }

  if (!weather) {
    return (
      <Card className="mb-3">
        <Card.Body className="text-center">
          <FaCloud size={48} className="text-muted mb-2" />
          <p className="text-muted">No hay datos de clima disponibles</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-3 weather-widget">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1">
              <FaMapMarkerAlt className="text-primary me-2" />
              {weather.city || 'Ubicación'}
            </h5>
            {weather.country && <small className="text-muted">{weather.country}</small>}
          </div>
          <div className="text-end">
            <div className="weather-icon">
              {getWeatherIcon(weather.current?.weather_code)}
            </div>
            <small className="text-muted d-block">
              {getWeatherDescription(weather.current?.weather_code)}
            </small>
          </div>
        </div>

        <Row className="text-center">
          <Col md={4}>
            <div className="weather-stat">
              <FaTemperatureHigh className="text-danger mb-2" size={24} />
              <h4 className="mb-0">
                {weather.current?.temperature ? `${Math.round(weather.current.temperature)}°C` : '--'}
              </h4>
              <small className="text-muted">Temperatura</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="weather-stat">
              <FaWind className="text-info mb-2" size={24} />
              <h4 className="mb-0">
                {weather.current?.windspeed ? `${Math.round(weather.current.windspeed * 3.6)} km/h` : '--'}
              </h4>
              <small className="text-muted">Viento</small>
            </div>
          </Col>
          <Col md={4}>
            <div className="weather-stat">
              <FaTint className="text-primary mb-2" size={24} />
              <h4 className="mb-0">
                {weather.daily?.precipitation ? `${weather.daily.precipitation} mm` : '--'}
              </h4>
              <small className="text-muted">Precipitación</small>
            </div>
          </Col>
        </Row>

        {weather.daily?.max_temp && weather.daily?.min_temp && (
          <div className="mt-3 text-center">
            <small className="text-muted">
              Máx: {Math.round(weather.daily.max_temp)}°C /
              Mín: {Math.round(weather.daily.min_temp)}°C
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget;