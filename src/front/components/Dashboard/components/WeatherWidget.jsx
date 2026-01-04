// src/front/components/Dashboard/components/WeatherWidget.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaCloud, FaTemperatureHigh, FaWind, FaMapMarkerAlt, FaTint, FaEye, FaSun } from 'react-icons/fa';
import './WeatherWidget.css';

const WeatherWidget = ({ city, latitude, longitude, compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWeatherImage = (weatherCode) => {
    // URLs de imágenes para diferentes condiciones del clima
    const weatherImages = {
      0: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop', // Despejado
      1: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop', // Mayormente despejado
      2: 'https://images.unsplash.com/photo-1534088388752-e0fd975b5b83?w=400&h=200&fit=crop', // Parcialmente nublado
      3: 'https://images.unsplash.com/photo-1534088388752-e0fd975b5b83?w=400&h=200&fit=crop', // Nublado
      45: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop', // Niebla
      48: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop', // Niebla escarcha
      51: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Llovizna ligera
      53: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Llovizna moderada
      55: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Llovizna densa
      56: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nieve ligera
      57: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nieve moderada
      61: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Lluvia ligera
      63: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Lluvia moderada
      65: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Lluvia fuerte
      66: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nieve ligera
      67: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nieve moderada
      71: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nevada ligera
      73: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nevada moderada
      75: 'https://images.unsplash.com/photo-1518680477839-3db6a548b627?w=400&h=200&fit=crop', // Nevada fuerte
      80: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Chubascos ligeros
      81: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Chubascos moderados
      82: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Chubascos violentos
      95: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Tormenta ligera
      96: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Tormenta moderada
      99: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=200&fit=crop', // Tormenta fuerte
    };
    return weatherImages[weatherCode] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop';
  };

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
        let maxRetries = 3;
        let retryCount = 0;
        let data = null;

        const fetchWithRetry = async (url, options, retries = 3) => {
          for (let i = 0; i < retries; i++) {
            try {
              const response = await fetch(url, options);
              if (response.ok) {
                return await response.json();
              } else if (response.status === 401) {
                throw new Error('No autorizado');
              } else if (response.status === 404) {
                throw new Error('Ciudad no encontrada');
              } else if (response.status === 429) {
                // Rate limit - esperar y reintentar
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                continue;
              }
            } catch (err) {
              if (i === retries - 1) throw err;
              await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
          }
          throw new Error('Error al obtener datos del clima');
        };

        if (city) {
          url = `http://127.0.0.1:3001/api/weather/${city}`;
          data = await fetchWithRetry(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } else if (latitude && longitude) {
          url = 'http://127.0.0.1:3001/api/weather/coordinates';
          data = await fetchWithRetry(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ latitude, longitude })
          });
        }

        console.log('Weather data received:', data);

        // Validar datos recibidos
        if (!data || !data.current) {
          throw new Error('Datos del clima inválidos');
        }

        // Validar temperatura
        if (data.current.temperature === undefined || data.current.temperature === null) {
          console.warn('Temperature not available, using default');
          data.current.temperature = 0;
        }

        // Validar código del clima
        if (data.current.weathercode === undefined || data.current.weathercode === null) {
          console.warn('Weather code not available, using default (0)');
          data.current.weathercode = 0;
        }

        setWeather(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err.message || 'Error al obtener el clima');

        // En caso de error, establecer datos por defecto para que no se rompa el componente
        setWeather({
          city: city || 'Ubicación',
          current: {
            temperature: 0,
            weathercode: 0,
            windspeed: 0
          },
          daily: {
            max_temp: 0,
            min_temp: 0,
            precipitation: 0
          }
        });
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
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>⚠️ Error del Clima</Alert.Heading>
        <p>{error}</p>
        <small className="d-block text-muted">
          Intentando mostrar datos por defecto...
        </small>
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

  if (compact && weather) {
    return (
      <div className="weather-compact">
        <div className="weather-compact-image">
          <img
            src={getWeatherImage(weather.current?.weathercode)}
            alt={getWeatherDescription(weather.current?.weathercode)}
            className="w-100 h-100"
            style={{ objectFit: 'cover', height: '120px' }}
          />
          <div className="weather-compact-overlay">
            <div className="d-flex justify-content-between align-items-center text-white">
              <div>
                <h6 className="mb-0 small">
                  <FaMapMarkerAlt className="me-1" />
                  {weather.city || 'Ubicación'}
                </h6>
                <small>{getWeatherIcon(weather.current?.weathercode)} {Math.round(weather.current?.temperature || 0)}°C</small>
              </div>
              <div className="text-end">
                <small className="d-block">{getWeatherDescription(weather.current?.weathercode)}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-3 weather-widget">
      <div className="weather-image-container">
        <img
          src={getWeatherImage(weather.current?.weathercode)}
          alt={getWeatherDescription(weather.current?.weathercode)}
          className="weather-image"
        />
        <div className="weather-overlay">
          <div className="d-flex justify-content-between align-items-start">
            <div className="text-white">
              <h5 className="mb-1">
                <FaMapMarkerAlt className="me-2" />
                {weather.city || 'Ubicación'}
              </h5>
              {weather.country && <small>{weather.country}</small>}
            </div>
            <div className="text-end text-white">
              <div className="weather-icon-large">
                {getWeatherIcon(weather.current?.weathercode)}
              </div>
              <small className="d-block">
                {getWeatherDescription(weather.current?.weathercode)}
              </small>
            </div>
          </div>
        </div>
      </div>

      <Card.Body>
        <Row className="text-center">
          <Col md={3}>
            <div className="weather-stat">
              <FaTemperatureHigh className="text-danger mb-2" size={20} />
              <h5 className="mb-0">
                {weather.current?.temperature ? `${Math.round(weather.current.temperature)}°C` : '--'}
              </h5>
              <small className="text-muted">Actual</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="weather-stat">
              <FaSun className="text-warning mb-2" size={20} />
              <h5 className="mb-0">
                {weather.daily?.max_temp ? `${Math.round(weather.daily.max_temp)}°C` : '--'}
              </h5>
              <small className="text-muted">Máxima</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="weather-stat">
              <FaWind className="text-info mb-2" size={20} />
              <h5 className="mb-0">
                {weather.current?.windspeed ? `${Math.round(weather.current.windspeed * 3.6)} km/h` : '--'}
              </h5>
              <small className="text-muted">Viento</small>
            </div>
          </Col>
          <Col md={3}>
            <div className="weather-stat">
              <FaTint className="text-primary mb-2" size={20} />
              <h5 className="mb-0">
                {weather.daily?.precipitation ? `${weather.daily.precipitation} mm` : '--'}
              </h5>
              <small className="text-muted">Lluvia</small>
            </div>
          </Col>
        </Row>

        {weather.daily?.min_temp && (
          <div className="mt-3 text-center">
            <Badge bg="secondary" className="me-2">
              Mín: {Math.round(weather.daily.min_temp)}°C
            </Badge>
            <Badge bg="primary">
              Humedad: {weather.current?.is_day === 1 ? 'Día' : 'Noche'}
            </Badge>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget;