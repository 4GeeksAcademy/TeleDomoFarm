from app import app, db
from api.models import User

def init_db():
    with app.app_context():
        # Crear todas las tablas
        db.create_all()
        
        # Verificar si ya existe un administrador
        if not User.query.filter_by(rol='admin').first():
            admin = User(
                nombre="Administrador",
                correo="admin@tudominio.com",
                contraseña="tucontraseña",  # Se hasheará automáticamente
                rol="admin",
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Usuario administrador creado exitosamente!")
            print(f"👤 Email: admin@tudominio.com")
            print("🔑 Contraseña: tucontraseña")
        else:
            print("ℹ️  Ya existe un usuario administrador en la base de datos")

if __name__ == "__main__":
    print("🔧 Inicializando la base de datos...")
    init_db()