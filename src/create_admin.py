from app import app, db
from api.models import User

def create_admin(email, password):
    with app.app_context():
        # Verificar si ya existe un usuario con ese correo
        if User.query.filter_by(correo=email).first():
            print(f"Error: Ya existe un usuario con el correo {email}")
            return False
            
        # Crear el usuario administrador
        try:
            admin = User(
                nombre="Administrador",
                correo=email,
                contraseña=password,
                rol="admin",
                is_active=True
            )
            
            db.session.add(admin)
            db.session.commit()
            
            print("¡Usuario administrador creado exitosamente!")
            print(f"Email: {email}")
            print("Contraseña: [la que proporcionaste]")
            print("Rol: admin")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al crear el usuario administrador: {str(e)}")
            return False

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Uso: python create_admin.py <email> <contraseña>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    create_admin(email, password)