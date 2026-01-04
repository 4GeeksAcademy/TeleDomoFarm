import sys
import os

# Agregar el directorio src al path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from app import create_app, db
from api.models import User

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Verificar si ya existe un usuario administrador
        existing_admin = User.query.filter_by(email='admin@teledomofarm.com').first()
        if existing_admin:
            print("Ya existe un usuario administrador:")
            print(f"   Email: {existing_admin.email}")
            print(f"   Nombre: {existing_admin.first_name} {existing_admin.last_name}")
            return existing_admin
        
        # Crear nuevo usuario administrador
        try:
            admin = User(
                email='admin@teledomofarm.com',
                first_name='Administrador',
                last_name='TeleDomoFarm',
                role='admin',
                is_active=True
            )
            admin.set_password('admin123')
            
            db.session.add(admin)
            db.session.commit()
            
            print("Usuario administrador creado exitosamente!")
            print("   Email: admin@teledomofarm.com")
            print("   Contraseña: admin123")
            print("   Rol: admin")
            print("\nUsa estas credenciales para iniciar sesión en la aplicación")
            return admin
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al crear el usuario administrador: {str(e)}")
            return None

if __name__ == "__main__":
    create_admin_user()
