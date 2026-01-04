from app import app, db
from api.models import User

def create_tables():
    with app.app_context():
        # Eliminar tablas existentes (opcional, ten cuidado en producción)
        db.drop_all()
        
        # Crear todas las tablas
        db.create_all()
        
        # Verificar si ya existe un administrador
        if not User.query.filter_by(rol='admin').first():
            admin = User(
                nombre="Administrador",
                correo="admin@tudominio.com",
                contraseña="tucontraseña",
                rol="admin",
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Usuario administrador creado exitosamente!")
            print("👤 Email: admin@tudominio.com")
            print("🔑 Contraseña: tucontraseña")
        else:
            print("ℹ️  Ya existe un usuario administrador en la base de datos")

if __name__ == "__main__":
    print("🔧 Creando tablas y usuario administrador...")
    create_tables()