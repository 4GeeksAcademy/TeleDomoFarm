import os
import time
import sqlite3
import psutil
from src.app import create_app, db
from src.api.models import User, Field, Equipment, Inventory

def kill_processes_using_file(filepath):
    """Mata los procesos que están usando el archivo de la base de datos"""
    filepath = os.path.abspath(filepath)
    for proc in psutil.process_iter(['pid', 'name', 'open_files']):
        try:
            for file in proc.info['open_files'] or []:
                if filepath == file.path:
                    print(f"🔴 Cerrando proceso {proc.info['name']} (PID: {proc.info['pid']}) que está usando la base de datos")
                    proc.kill()
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass

def reset_database():
    app = create_app()
    
    with app.app_context():
        try:
            db_path = os.path.join(os.path.dirname(__file__), 'src', 'app.db')
            db_path = os.path.abspath(db_path)
            
            print("🔍 Verificando base de datos en:", db_path)
            
            # Cerrar conexiones existentes
            db.session.close_all()
            
            # Intentar matar procesos que puedan estar usando la base de datos
            kill_processes_using_file(db_path)
            
            # Pequeña pausa para asegurar que los procesos se cierren
            time.sleep(2)
            
            # Verificar si el archivo existe
            if os.path.exists(db_path):
                try:
                    os.remove(db_path)
                    print("Base de datos eliminada exitosamente")
                except PermissionError as e:
                    print(f" No se pudo eliminar {db_path}")
                    print("   Intenta estos pasos:")
                    print("   1. Cierra VS Code completamente")
                    print("   2. Abre el Administrador de tareas (Ctrl+Shift+Esc)")
                    print("   3. Busca y finaliza todos los procesos de Python")
                    print("   4. Intenta eliminar el archivo manualmente")
                    print(f"   5. Luego ejecuta: del \"{db_path}\"")
                    return
            else:
                print("La base de datos no existe, se creara una nueva")
            
            # Crear todas las tablas
            print("Creando tablas...")
            db.create_all()
            
            # Verificar tablas creadas
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print("Tablas en la base de datos:", tables)
            
            # Crear usuario administrador
            admin = User(
                email='admin@example.com',
                first_name='Admin',
                last_name='User',
                is_active=True,
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Usuario administrador creado exitosamente")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    reset_database()