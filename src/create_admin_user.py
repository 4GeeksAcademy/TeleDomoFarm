import os
from app import app, db
from api.models import User

def create_admin():
    with app.app_context():
        try:
            # Check if admin already exists
            admin = User.query.filter_by(correo="admin@teledomofarm.com").first()
            if admin:
                print("Admin user already exists!")
                print(f"Email: {admin.correo}")
                print(f"Role: {admin.rol}")
                return
            
            # Create new admin user
            admin = User(
                nombre="Admin User",
                correo="admin@teledomofarm.com",
                contraseña="Admin1234",
                rol="admin",
                is_active=True
            )
            
            db.session.add(admin)
            db.session.commit()
            
            print("Admin user created successfully!")
            print(f"Email: {admin.correo}")
            print("Password: Admin1234")
            print("Role: admin")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {str(e)}")
            if hasattr(e, 'orig') and hasattr(e.orig, 'args'):
                print(f"Database error details: {e.orig.args}")

if __name__ == "__main__":
    create_admin()
