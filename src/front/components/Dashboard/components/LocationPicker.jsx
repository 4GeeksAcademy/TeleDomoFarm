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

    // Buscar ciudades usando Nominatim (OpenStreetMap)
    const searchCities = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=es`
            );
            const data = await response.json();

            const formattedSuggestions = data.map(item => ({
                display_name: item.display_name,
                city: item.name,
                country: item.address?.country || '',
                latitude: parseFloat(item.lat),
                longitude: parseFloat(item.lon)
            }));

            setSuggestions(formattedSuggestions);
        } catch (err) {
            setError('Error al buscar ubicaciones');
        } finally {
            setLoading(false);
        }
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
            latitude: suggestion.latitude,
            longitude: suggestion.longitude
        });
        setSearchQuery(suggestion.display_name);
        setSuggestions([]);
        onLocationSelect(suggestion);
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('La geolocalización no está disponible en tu navegador');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocoding para obtener el nombre de la ciudad
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
                    );
                    const data = await response.json();

                    const newLocation = {
                        city: data.address?.city || data.address?.town || 'Ubicación actual',
                        latitude,
                        longitude
                    };

                    setLocation(newLocation);
                    setSearchQuery(data.display_name || `${latitude}, ${longitude}`);
                    onLocationSelect(newLocation);
                } catch (err) {
                    const newLocation = {
                        city: 'Ubicación actual',
                        latitude,
                        longitude
                    };
                    setLocation(newLocation);
                    setSearchQuery(`${latitude}, ${longitude}`);
                    onLocationSelect(newLocation);
                }

                setLoading(false);
            },
            (error) => {
                setError('No se pudo obtener tu ubicación actual');
                setLoading(false);
            }
        );
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
