// src/front/components/Dashboard/components/WeatherWidget.jsx
import React from 'react';
import { BsDroplet, BsThermometerSun, BsWind } from 'react-icons/bs';

const WeatherWidget = () => {
  // Mock data - replace with actual API call
  const weatherData = {
    temperature: 22,
    condition: 'Soleado',
    humidity: 65,
    wind: 12,
    forecast: [
      { day: 'Hoy', high: 24, low: 16, condition: 'sun' },
      { day: 'Mañana', high: 26, low: 17, condition: 'partly-cloudy' },
      { day: 'Mie', high: 23, low: 15, condition: 'rain' },
    ],
  };

  return (
    <div className="weather-widget">
      <div className="current-weather">
        <div className="temperature">
          <BsThermometerSun size={24} />
          <span>{weatherData.temperature}°C</span>
        </div>
        <div className="condition">{weatherData.condition}</div>
        <div className="details">
          <span><BsDroplet /> {weatherData.humidity}%</span>
          <span><BsWind /> {weatherData.wind} km/h</span>
        </div>
      </div>
      <div className="forecast">
        {weatherData.forecast.map((day, index) => (
          <div key={index} className="forecast-day">
            <div className="day">{day.day}</div>
            <div className={`weather-icon ${day.condition}`}></div>
            <div className="temps">
              <span className="high">{day.high}°</span>
              <span className="low">{day.low}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherWidget;