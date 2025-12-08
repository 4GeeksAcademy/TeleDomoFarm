import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from api.models import db, User
from app import app  # ahora Python encontrará app.py
from werkzeug.security import generate_password_hash

with app.app_context():
    nuevo = User(
        nombre="Admin",
        correo="admin@example.com",
        contraseña=generate_password_hash("1234"),
        rol="admin",
        is_active=True
    )
    db.session.add(nuevo)
    db.session.commit()
    print("Usuario admin creado con éxito")
