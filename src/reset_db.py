from app import app, db
from api.models import User

def reset_database():
    with app.app_context():
        # Eliminar todas las tablas
        db.drop_all()
        
        # Crear todas las tablas
        db.create_all()
        
        # Crear usuario administrador
        admin = User(
            nombre="Administrador",
            correo="admin@tudominio.com",
            contraseña="tucontraseña",  # Se hasheará automáticamente
            rol="admin",
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Base de datos reiniciada y usuario administrador creado")
        print("👤 Email: admin@tudominio.com")
        print("🔑 Contraseña: tucontraseña")

if __name__ == "__main__":
    print("🔧 Reiniciando base de datos...")
    reset_database()