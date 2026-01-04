// src/front/components/Dashboard/components/Financials.jsx
import React from 'react';
import { Card, Table, ProgressBar, Row, Col } from 'react-bootstrap';
import { FaDollarSign, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';

const Financials = () => {
  // Datos de ejemplo
  const financialData = {
    totalIncome: 48500,
    totalExpenses: 32500,
    profit: 16000,
    budget: {
      used: 65000,
      total: 100000
    },
    transactions: [
      { id: 1, date: '2023-12-15', description: 'Venta de Trigo', amount: 12500, type: 'income' },
      { id: 2, date: '2023-12-14', description: 'Compra de Semillas', amount: 3200, type: 'expense' },
      { id: 3, date: '2023-12-10', description: 'Mantenimiento de Maquinaria', amount: 2800, type: 'expense' },
      { id: 4, date: '2023-12-05', description: 'Venta de Maíz', amount: 18700, type: 'income' },
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="financials-container">
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Ingresos Totales</h6>
                  <h3 className="mb-0 text-success">{formatCurrency(financialData.totalIncome)}</h3>
                  <small className="text-success">+12% vs mes anterior</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaMoneyBillWave size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Gastos Totales</h6>
                  <h3 className="mb-0 text-danger">{formatCurrency(financialData.totalExpenses)}</h3>
                  <small className="text-danger">+5% vs mes anterior</small>
                </div>
                <div className="bg-danger bg-opacity-10 p-3 rounded">
                  <FaMoneyBillWave size={24} className="text-danger" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Beneficio Neto</h6>
                  <h3 className="mb-0 text-primary">{formatCurrency(financialData.profit)}</h3>
                  <small className="text-primary">+25% vs mes anterior</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaChartLine size={24} className="text-primary" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Últimas Transacciones</h5>
            </Card.Header>
            <Card.Body>
              <Table hover>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th className="text-end">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString('es-AR')}</td>
                      <td>{transaction.description}</td>
                      <td 
                        className={`text-end ${
                          transaction.type === 'income' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'} 
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Presupuesto</h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Utilizado</span>
                  <span className="fw-bold">
                    {formatCurrency(financialData.budget.used)} / {formatCurrency(financialData.budget.total)}
                  </span>
                </div>
                <ProgressBar 
                  now={(financialData.budget.used / financialData.budget.total) * 100} 
                  variant="primary" 
                  className="mb-3"
                />
                <div className="text-end">
                  <small className="text-muted">
                    {Math.round((financialData.budget.used / financialData.budget.total) * 100)}% del presupuesto
                  </small>
                </div>
              </div>
              
              <div className="mt-auto">
                <h6 className="mb-3">Resumen Anual</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Ingresos</span>
                  <span className="text-success">{formatCurrency(125000)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Gastos</span>
                  <span className="text-danger">{formatCurrency(89000)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Beneficio</span>
                  <span className="text-primary">{formatCurrency(36000)}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Financials;