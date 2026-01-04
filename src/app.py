import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import timedelta
from dotenv import load_dotenv
import logging
from flask_login import LoginManager

# =====================
# Cargar variables entorno
# =====================
load_dotenv()

# =====================
# Logging
# =====================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================
# Extensiones
# =====================
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__)

    # =====================
    # Configuración
    # =====================
    app.config.update(
        SECRET_KEY=os.getenv('FLASK_APP_KEY', 'dev-key'),
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'jwt-secret'),
        JWT_ACCESS_TOKEN_EXPIRES=timedelta(days=1),
        SQLALCHEMY_DATABASE_URI='sqlite:///' + os.path.join(
            os.path.abspath(os.path.dirname(__file__)),
            'app.db'
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ECHO=True
    )

    # =====================
    # Inicializar extensiones
    # =====================
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    login_manager.init_app(app)

    # =====================
    # IMPORTAR MODELOS (CLAVE PARA ALEMBIC)
    # =====================
    from src.api.models import User, Field, Equipment, Inventory

    # =====================
    # CORS
    # =====================
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # =====================
    # Blueprints
    # =====================
    from src.api.routes import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    # =====================
    # Admin
    # =====================
    from src.api.admin import setup_admin
    setup_admin(app)

    # =====================
    # Rutas prueba
    # =====================
    @app.route('/api/test', methods=['GET'])
    def test_connection():
        return jsonify({"message": "Backend OK"}), 200

    # =====================
    # Errores
    # =====================
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Error interno"}), 500

    return app


# =====================
# Crear app
# =====================
app = create_app()


# =====================
# Flask-Login loader
# =====================
@login_manager.user_loader
def load_user(user_id):
    from src.api.models import User
    return User.query.get(int(user_id))


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=True)
