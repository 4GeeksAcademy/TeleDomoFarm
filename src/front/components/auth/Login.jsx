import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Card, Alert, Row, Col } from "react-bootstrap";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones front-end
    if (!email.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido");
      setLoading(false);
      return;
    }

    if (password.trim() === "") {
      setError("La contraseña no puede estar vacía");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // Guardar token y datos del usuario
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      // Redirigir según rol
      if (data.user?.rol === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Iniciar Sesión</h2>
                <p className="text-muted">Ingresa tus credenciales para continuar</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/registro" className="text-decoration-none">
                    ¿No tienes una cuenta? Regístrate
                  </Link>
                  <br />
                  <Link to="/olvide-password" className="text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
