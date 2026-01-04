from app import app, db
from api.models import User, Field, Equipment, Inventory, Staff

def create_tables():
    with app.app_context():
        # Eliminar tablas existentes (opcional, ten cuidado en producción)
        db.drop_all()
        
        # Crear todas las tablas
        db.create_all()
        
        # Crear usuario administrador
        if not User.query.filter_by(rol='admin').first():
            admin = User(
                nombre="Administrador",
                correo="admin@teledomofarm.com",
                contraseña="Admin1234",
                rol="admin",
                is_active=True
            )
            db.session.add(admin)
            print("Usuario administrador creado exitosamente!")
            print("   Email: admin@teledomofarm.com")
            print("   Contraseña: Admin1234")
        else:
            print("Ya existe un usuario administrador en la base de datos")
        
        # Crear usuario Juan
        if not User.query.filter_by(correo="juan@teledomofarm.com").first():
            juan = User(
                nombre="Juan",
                correo="juan@teledomofarm.com", 
                contraseña="Admin1234",
                rol="usuario",
                is_active=True
            )
            db.session.add(juan)
            print("Usuario Juan creado exitosamente!")
            print("   Email: juan@teledomofarm.com")
            print("   Contraseña: Admin1234")
        
        # Obtener usuarios para asignar
        admin_user = User.query.filter_by(correo="admin@teledomofarm.com").first()
        juan_user = User.query.filter_by(correo="juan@teledomofarm.com").first()
        
        # Crear campos de ejemplo
        campos_data = [
            {
                "name": "Finca Principal",
                "location": "Kilómetro 12, Vía a Girardot",
                "city": "Fusagasugá",
                "latitude": 4.3385,
                "longitude": -74.3639,
                "area": 50,
                "crop": "Maíz",
                "status": "Activo",
                "next_action": "Fertilización",
                "user_id": admin_user.id if admin_user else None
            },
            {
                "name": "Parcela Norte",
                "location": "Vereda La Esperanza",
                "city": "Fusagasugá", 
                "latitude": 4.3421,
                "longitude": -74.3682,
                "area": 25,
                "crop": "Fríjol",
                "status": "En siembra",
                "next_action": "Riego",
                "user_id": juan_user.id if juan_user else None
            }
        ]
        
        for campo_data in campos_data:
            if not Field.query.filter_by(name=campo_data["name"]).first():
                campo = Field(**campo_data)
                db.session.add(campo)
                print(f"Campo '{campo_data['name']}' creado")
        
        # Crear personal
        personal_data = [
            {
                "name": "Carlos Rodríguez",
                "email": "carlos@teledomofarm.com",
                "phone": "3124567890",
                "position": "Supervisor de Campo",
                "salary": 2500000,
                "status": "Activo",
                "field_id": 1,  # Finca Principal
                "user_id": admin_user.id if admin_user else None
            },
            {
                "name": "María González",
                "email": "maria@teledomofarm.com", 
                "phone": "3112345678",
                "position": "Operaria",
                "salary": 1800000,
                "status": "Activo",
                "field_id": 2,  # Parcela Norte
                "user_id": juan_user.id if juan_user else None
            }
        ]
        
        for personal in personal_data:
            if not Staff.query.filter_by(email=personal["email"]).first():
                staff = Staff(**personal)
                db.session.add(staff)
                print(f"Personal '{personal['name']}' creado")
        
        # Crear equipos
        equipos_data = [
            {
                "name": "Tractor John Deere 5080",
                "type": "Maquinaria Agrícola",
                "brand": "John Deere",
                "model": "5080",
                "year": 2020,
                "serial_number": "JD5080-2020-001",
                "purchase_date": "2020-03-15",
                "status": "Operativo",
                "last_maintenance": "2024-01-01",
                "next_maintenance": "2024-04-01",
                "notes": "Tractor principal para labranza",
                "field_id": 1,  # Finca Principal
                "user_id": admin_user.id if admin_user else None
            },
            {
                "name": "Bombilla de Riego",
                "type": "Sistema de Riego",
                "brand": "Rain Bird",
                "model": "5004",
                "year": 2021,
                "serial_number": "RB5004-2021-003",
                "purchase_date": "2021-06-20",
                "status": "Operativo",
                "last_maintenance": "2024-01-10",
                "next_maintenance": "2024-04-10",
                "notes": "Sistema de riego por goteo",
                "field_id": 2,  # Parcela Norte
                "user_id": juan_user.id if juan_user else None
            }
        ]
        
        for equipo_data in equipos_data:
            if not Equipment.query.filter_by(serial_number=equipo_data["serial_number"]).first():
                equipo = Equipment(**equipo_data)
                db.session.add(equipo)
                print(f"Equipo '{equipo_data['name']}' creado")
        
        # Crear inventario
        inventario_data = [
            {
                "name": "Semillas de Maíz Híbrido",
                "quantity": 500,
                "min_quantity": 100,
                "unit": "kg",
                "category": "Semillas",
                "supplier": "Semillas S.A.",
                "notes": "Semilla de alta calidad para siembra",
                "field_id": 1,  # Finca Principal
                "user_id": admin_user.id if admin_user else None
            },
            {
                "name": "Fertilizante NPK 15-15-15",
                "quantity": 200,
                "min_quantity": 50,
                "unit": "sacos",
                "category": "Fertilizantes",
                "supplier": "Agroquímicos del Campo",
                "notes": "Fertilizante balanceado para maíz",
                "field_id": 2,  # Parcela Norte
                "user_id": juan_user.id if juan_user else None
            },
            {
                "name": "Herbicida Glifosato",
                "quantity": 50,
                "min_quantity": 10,
                "unit": "litros",
                "category": "Herbicidas",
                "supplier": "Crop Protection Ltd",
                "notes": "Control de malezas",
                "field_id": 1,  # Finca Principal
                "user_id": admin_user.id if admin_user else None
            }
        ]
        
        for item_data in inventario_data:
            if not Inventory.query.filter_by(name=item_data["name"]).first():
                item = Inventory(**item_data)
                db.session.add(item)
                print(f"Inventario '{item_data['name']}' creado")
        
        # Confirmar todos los cambios
        db.session.commit()
        print("\nBase de datos inicializada con datos de ejemplo!")
        print("Resumen:")
        print(f"   - Usuarios: {User.query.count()}")
        print(f"   - Campos: {Field.query.count()}")
        print(f"   - Personal: {Staff.query.count()}")
        print(f"   - Equipos: {Equipment.query.count()}")
        print(f"   - Inventario: {Inventory.query.count()}")

if __name__ == "__main__":
    print("Creando tablas y datos iniciales...")
    create_tables()