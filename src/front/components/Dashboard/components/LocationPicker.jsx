import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
    const [location, setLocation] = useState(initialLocation || {
        city: '',
        latitude: null,
        longitude: null
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lista de ciudades colombianas importantes para búsqueda rápida
    const colombianCities = [
        { city: 'Bogotá', display_name: 'Bogotá, Colombia' },
        { city: 'Medellín', display_name: 'Medellín, Colombia' },
        { city: 'Cali', display_name: 'Cali, Colombia' },
        { city: 'Barranquilla', display_name: 'Barranquilla, Colombia' },
        { city: 'Cartagena', display_name: 'Cartagena, Colombia' },
        { city: 'Bucaramanga', display_name: 'Bucaramanga, Colombia' },
        { city: 'Pereira', display_name: 'Pereira, Colombia' },
        { city: 'Cúcuta', display_name: 'Cúcuta, Colombia' },
        { city: 'Ibagué', display_name: 'Ibagué, Colombia' },
        { city: 'Boyacá', display_name: 'Boyacá, Colombia' },
        { city: 'Tunja', display_name: 'Tunja, Colombia' },
        { city: 'Manizales', display_name: 'Manizales, Colombia' },
        { city: 'Villavicencio', display_name: 'Villavicencio, Colombia' },
        { city: 'Neiva', display_name: 'Neiva, Colombia' },
        { city: 'Pasto', display_name: 'Pasto, Colombia' }
    ];

    // Buscar ciudades en nuestra lista
    const searchCities = (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        const filtered = colombianCities.filter(city =>
            city.city.toLowerCase().includes(query.toLowerCase()) ||
            city.display_name.toLowerCase().includes(query.toLowerCase())
        );

        setSuggestions(filtered);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchCities(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSuggestionClick = (suggestion) => {
        setLocation({
            city: suggestion.city,
            latitude: null,
            longitude: null
        });
        setSearchQuery(suggestion.display_name);
        setSuggestions([]);
        onLocationSelect({
            city: suggestion.city,
            latitude: null,
            longitude: null
        });
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('La geolocalización no está disponible en tu navegador');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                const newLocation = {
                    city: 'Ubicación actual',
                    latitude,
                    longitude
                };

                setLocation(newLocation);
                setSearchQuery(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                onLocationSelect(newLocation);
                setLoading(false);
            },
            (error) => {
                setError('No se pudo obtener tu ubicación actual');
                setLoading(false);
            }
        );
    };

    const handleManualInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Si el usuario escribe una ciudad, actualizarla inmediatamente
        if (value.length > 2) {
            const foundCity = colombianCities.find(city =>
                city.city.toLowerCase() === value.toLowerCase()
            );

            if (foundCity) {
                setLocation({
                    city: foundCity.city,
                    latitude: null,
                    longitude: null
                });
                onLocationSelect({
                    city: foundCity.city,
                    latitude: null,
                    longitude: null
                });
            }
        }
    };

    return (
        <Card className="mb-3">
            <Card.Header>
                <h5 className="mb-0">
                    <FaMapMarkerAlt className="text-primary me-2" />
                    Ubicación del Campo
                </h5>
            </Card.Header>
            <Card.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <Form.Group className="mb-3">
                    <Form.Label>Buscar ciudad o dirección</Form.Label>
                    <div className="position-relative">
                        <Form.Control
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ej: Buenos Aires, Argentina"
                            className="pe-5"
                        />
                        <FaSearch className="position-absolute"
                            style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }}
                        />
                    </div>

                    {suggestions.length > 0 && (
                        <div className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm"
                            style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                    <div className="fw-bold">{suggestion.city}</div>
                                    <small className="text-muted">{suggestion.display_name}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button
                        variant="outline-primary"
                        onClick={handleGetCurrentLocation}
                        disabled={loading}
                        className="w-100"
                    >
                        <FaMapMarkerAlt className="me-2" />
                        {loading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
                    </Button>
                </div>

                {location.city && (
                    <div className="mt-3 p-2 bg-light rounded">
                        <small className="text-muted">Ubicación seleccionada:</small>
                        <div className="fw-bold">
                            {location.city}
                            {location.latitude && location.longitude && (
                                <small className="text-muted d-block">
                                    Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
                                </small>
                            )}
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default LocationPicker;
