
import click
from api.models import db, User

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with youy database, for example: Import the price of bitcoin every night as 12am
"""
def setup_commands(app):
    
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users") # name of our command
    @click.argument("count") # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    @app.cli.command("insert-test-data")
    def insert_test_data():
        pass

    @app.cli.command("create-admin")
    @click.argument("email")
    @click.argument("password")
    def create_admin(email, password):
        """Crea un nuevo usuario administrador"""
        try:
            # Verificar si ya existe un usuario con ese correo
            if User.query.filter_by(correo=email).first():
                print(f"Error: Ya existe un usuario con el correo {email}")
                return
                
            # Crear el usuario administrador
            admin = User()
            admin.nombre = "Administrador"
            admin.correo = email
            admin.contraseña = password  # El modelo se encargará de hashearla
            admin.rol = "admin"
            admin.is_active = True
            
            db.session.add(admin)
            db.session.commit()
            
            print(f"Usuario administrador creado exitosamente!")
            print(f"Email: {email}")
            print("Rol: admin")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error al crear el usuario administrador: {str(e)}")