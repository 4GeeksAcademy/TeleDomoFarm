from flask import Flask, request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, create_access_token
from werkzeug.exceptions import Unauthorized
from datetime import datetime
import requests
from .models import db, User, Field, Inventory, Equipment, Staff
from werkzeug.security import check_password_hash


# Crear el Blueprint 'api'
api = Blueprint('api', __name__)

# ============================
# Middleware JWT
# ============================
@api.before_request
def check_jwt():
    # Permitir rutas abiertas
    open_routes = (
        '/api/login',
        '/api/register',
        '/api/weather',  # Permitir rutas de clima para pruebas
        '/api/ping'  # Permitir ping para pruebas de conexión
    )

    for route in open_routes:
        if request.path.startswith(route):
            return

    # Para rutas protegidas, verificar JWT
    try:
        verify_jwt_in_request()
    except Exception as e:
        print(f"DEBUG: Error en JWT: {str(e)}")
        raise Unauthorized("Missing Authorization Header")

# ============================
# Rutas
# ============================

# Endpoint de prueba para verificar que el servidor está funcionando
@api.route('/ping', methods=['GET'])
def ping():
    response = jsonify({"msg": "pong", "server": "running"})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

# Ruta para registrar un nuevo usuario (SIN TOKEN)
@api.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validar campos requeridos
        required_fields = ['nombre', 'correo', 'contraseña']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"msg": f"El campo {field} es requerido"}), 400

        # Verificar si el correo ya existe
        if User.query.filter_by(email=data['correo']).first():
            return jsonify({"msg": "El correo ya está registrado"}), 400

        # Crear nuevo usuario
        user = User(
            email=data['correo'],
            first_name=data['nombre'],
            last_name=data.get('apellido', ''),
            role='user'
        )
        user.set_password(data['contraseña'])  # Hashear la contraseña

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "msg": "Usuario registrado exitosamente",
            "user": {
                "id": user.id,
                "nombre": user.first_name,
                "correo": user.email,
                "rol": user.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al registrar el usuario", "error": str(e)}), 500

# Ruta para iniciar sesión (SIN TOKEN)
@api.route('/login', methods=['POST', 'OPTIONS'])
def login():
    print(f"DEBUG: Login endpoint llamado con método: {request.method}")
    
    if request.method == 'OPTIONS':
        print("DEBUG: Procesando OPTIONS request")
        response = jsonify({'message': 'Preflight check passed'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        print("DEBUG: Procesando POST request")
        data = request.get_json()
        print(f"DEBUG: Datos recibidos: {data}")
        
        # Validar campos requeridos
        if not data or 'correo' not in data or 'contraseña' not in data:
            print("DEBUG: Faltan campos requeridos")
            return jsonify({"msg": "Correo y contraseña son requeridos"}), 400

        # Buscar usuario
        user = User.query.filter_by(email=data['correo']).first()
        print(f"DEBUG: Usuario encontrado: {user is not None}")
        
        # Verificar usuario y contraseña
        if not user or not user.check_password(data['contraseña']):
            print("DEBUG: Credenciales incorrectas")
            return jsonify({"msg": "Correo o contraseña incorrectos"}), 401
        
        print("DEBUG: Credenciales correctas, generando token")
        # Generar token JWT
        access_token = create_access_token(identity={
            'id': user.id,
            'email': user.email
        })
        
        # Crear respuesta
        response = jsonify({
            "msg": "Inicio de sesión exitoso",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "nombre": user.first_name,
                "correo": user.email,
                "rol": user.role
            }
        })
        
        # Configurar headers CORS
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        print("DEBUG: Respuesta de login enviada")
        return response, 200

    except Exception as e:
        print(f"DEBUG: Error en login: {str(e)}")
        return jsonify({"msg": "Error al iniciar sesión", "error": str(e)}), 500


# Ruta para obtener todos los usuarios (CON TOKEN + ADMIN)
@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        current_user_obj = User.query.get(current_user_id)

        if not current_user_obj:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        if current_user_obj.role != 'admin':
            return jsonify({"msg": "No autorizado"}), 403

        users = User.query.all()
        users_list = [user.serialize() for user in users]

        return jsonify(users_list), 200

    except Exception as e:
        return jsonify({
            "msg": "Error al obtener los usuarios",
            "error": str(e)
        }), 500
#campos de cultivo
@api.route('/fields', methods=['GET'])
@jwt_required()
def get_fields():
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        fields = Field.query.filter_by(user_id=current_user_id).all()
        return jsonify({
            "fields": [field.serialize() for field in fields]
        }), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener los campos", "error": str(e)}), 500

@api.route('/fields', methods=['POST'])
@jwt_required()
def create_field():
    data = request.get_json()
    
    required_fields = ['name', 'crop', 'area']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"El campo {field} es requerido"}), 400
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        new_field = Field(
            name=data['name'],
            crop=data['crop'],
            area=float(data['area']),
            location=data.get('location'),
            city=data.get('city'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            status=data.get('status', 'Activo'),
            next_action=data.get('next_action'),
            user_id=current_user_id
        )
        db.session.add(new_field)
        db.session.commit()
        return jsonify(new_field.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

@api.route('/fields/<int:field_id>', methods=['PUT'])
@jwt_required()
def update_field(field_id):
    field = Field.query.get(field_id)
    if not field:
        return jsonify({"msg": "Campo no encontrado"}), 404
    data = request.get_json()
    try:
        field.name = data.get('name', field.name)
        field.crop = data.get('crop', field.crop)
        if 'area' in data:
            field.area = float(data['area'])
        if 'status' in data:
            field.status = data['status']
        if 'next_action' in data:
            field.next_action = data['next_action']
        
        db.session.commit()
        return jsonify(field.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500
@api.route('/fields/<int:field_id>', methods=['DELETE'])
@jwt_required()
def delete_field(field_id):
    field = Field.query.get(field_id)
    if not field:
        return jsonify({"msg": "Campo no encontrado"}), 404
    try:
        db.session.delete(field)
        db.session.commit()
        return jsonify({"msg": "Campo eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": str(e)}), 500

# Rutas para el inventario
# Obtener todo el inventario
@api.route('/inventory', methods=['GET'])
@jwt_required()
def get_inventory():
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        inventory_items = Inventory.query.filter_by(user_id=current_user_id).all()
        return jsonify({
            "msg": "Inventario obtenido exitosamente",
            "inventory": [item.serialize() for item in inventory_items]
        }), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener inventario", "error": str(e)}), 500

# Agregar nuevo ítem al inventario
@api.route('/inventory', methods=['POST'])
@jwt_required()
def add_inventory_item():
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        
        # Validar campos requeridos
        required_fields = ['name', 'category', 'quantity', 'unit']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"msg": f"El campo {field} es requerido"}), 400
        
        new_item = Inventory(
            name=data['name'],
            category=data['category'],
            quantity=float(data['quantity']),
            unit=data['unit'],
            supplier=data.get('supplier'),
            min_quantity=float(data['min_quantity']) if data.get('min_quantity') else None,
            notes=data.get('notes'),
            field_id=data.get('field_id'),
            user_id=current_user_id
        )
        
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.serialize()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al agregar el ítem al inventario", "error": str(e)}), 500

# Actualizar ítem de inventario
@api.route('/inventory/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_inventory_item(item_id):
    try:
        item = Inventory.query.get(item_id)
        if not item:
            return jsonify({"msg": "Ítem no encontrado"}), 404
            
        data = request.get_json()
        
        # Actualizar campos
        item.name = data.get('name', item.name)
        item.category = data.get('category', item.category)
        item.quantity = float(data['quantity']) if 'quantity' in data else item.quantity
        item.unit = data.get('unit', item.unit)
        item.supplier = data.get('supplier', item.supplier)
        item.min_quantity = float(data['min_quantity']) if 'min_quantity' in data else item.min_quantity
        item.notes = data.get('notes', item.notes)
        item.field_id = data.get('field_id', item.field_id)
        
        db.session.commit()
        return jsonify(item.serialize()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el ítem", "error": str(e)}), 500

# Eliminar ítem de inventario
@api.route('/inventory/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory_item(item_id):
    try:
        item = Inventory.query.get(item_id)
        if not item:
            return jsonify({"msg": "Ítem no encontrado"}), 404
            
        db.session.delete(item)
        db.session.commit()
        return jsonify({"msg": "Ítem eliminado correctamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el ítem", "error": str(e)}), 500

# Equipos
@api.route('/equipment', methods=['GET'])
@jwt_required()
def get_equipment():
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        equipment = Equipment.query.filter_by(user_id=current_user_id).options(db.joinedload(Equipment.field)).all()
        return jsonify([{
            **eq.serialize(),
            'field': eq.field.serialize() if eq.field else None
        } for eq in equipment])
    except Exception as e:
        return jsonify({"msg": "Error al obtener el equipo", "error": str(e)}), 500

@api.route('/equipment', methods=['POST'])
@jwt_required()
def add_equipment():
    try:
        data = request.get_json()
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        
        # Convertir fechas si existen
        date_fields = ['purchase_date', 'last_maintenance', 'next_maintenance']
        for field in date_fields:
            if field in data and data[field]:
                if 'T' in str(data[field]):
                    data[field] = data[field].replace('T', ' ')
        
        # Convertir fechas a objetos date de Python
        def parse_date(date_str):
            if not date_str:
                return None
            try:
                return datetime.strptime(date_str, '%Y-%m-%d').date()
            except:
                return None
        
        # Crear el equipo
        equipment = Equipment(
            name=data.get('name'),
            type=data.get('type'),
            brand=data.get('brand'),
            model=data.get('model'),
            year=data.get('year'),
            serial_number=data.get('serial_number'),
            purchase_date=parse_date(data.get('purchase_date')),
            status=data.get('status', 'Activo'),
            last_maintenance=parse_date(data.get('last_maintenance')),
            next_maintenance=parse_date(data.get('next_maintenance')),
            notes=data.get('notes'),
            field_id=data.get('field_id'),
            user_id=current_user_id
        )
        
        db.session.add(equipment)
        db.session.commit()
        
        return jsonify(equipment.serialize()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al añadir el equipo", "error": str(e)}), 500

@api.route('/equipment/<int:equipment_id>', methods=['PUT'])
@jwt_required()
def update_equipment(equipment_id):
    """Actualizar equipo existente"""
    data = request.get_json()
    equipment = Equipment.query.get(equipment_id)

    if not equipment:
        return jsonify({"msg": "Equipo no encontrado"}), 404

    try:
        equipment.name = data.get('name', equipment.name)
        equipment.type = data.get('type', equipment.type)
        equipment.brand = data.get('brand', equipment.brand)
        equipment.model = data.get('model', equipment.model)
        equipment.year = data.get('year', equipment.year)
        equipment.serial_number = data.get('serial_number', equipment.serial_number)
        
        if 'purchase_date' in data:
            equipment.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
        if 'last_maintenance' in data:
            equipment.last_maintenance = datetime.strptime(data['last_maintenance'], '%Y-%m-%d')
        if 'next_maintenance' in data:
            equipment.next_maintenance = datetime.strptime(data['next_maintenance'], '%Y-%m-%d')
            
        equipment.status = data.get('status', equipment.status)
        equipment.notes = data.get('notes', equipment.notes)

        db.session.commit()
        return jsonify(equipment.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el equipo", "error": str(e)}), 500

@api.route('/equipment/<int:equipment_id>', methods=['DELETE'])
@jwt_required()
def delete_equipment(equipment_id):
    """Eliminar equipo"""
    try:
        equipment = Equipment.query.get(equipment_id)
        if not equipment:
            return jsonify({"msg": "Equipo no encontrado"}), 404
        
        db.session.delete(equipment)
        db.session.commit()
        return jsonify({"msg": "Equipo eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el equipo", "error": str(e)}), 500

# ============================
# STAFF ENDPOINTS
# ============================

@api.route('/staff', methods=['GET'])
@jwt_required()
def get_staff():
    """Obtener todo el personal del usuario actual"""
    try:
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        staff_list = Staff.query.filter_by(user_id=current_user_id).all()
        return jsonify([staff.serialize() for staff in staff_list]), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener el personal", "error": str(e)}), 500

@api.route('/staff', methods=['POST'])
@jwt_required()
def create_staff():
    """Crear nuevo personal"""
    try:
        data = request.get_json()
        print(f"DEBUG: Staff POST - Datos recibidos: {data}")
        
        current_user = get_jwt_identity()
        current_user_id = current_user['id'] if isinstance(current_user, dict) else current_user
        print(f"DEBUG: Staff POST - User ID: {current_user_id}")
        
        # Validar campos requeridos
        required_fields = ['name', 'email', 'position']
        for field in required_fields:
            if field not in data or not data[field]:
                print(f"DEBUG: Staff POST - Campo faltante: {field}")
                return jsonify({"msg": f"El campo {field} es requerido"}), 400
        
        # Verificar si el email ya existe para el usuario actual
        existing_staff = Staff.query.filter_by(email=data['email'], user_id=current_user_id).first()
        if existing_staff:
            print(f"DEBUG: Staff POST - Email ya existe: {data['email']}")
            return jsonify({"msg": "Ya existe un personal con ese email"}), 400
        
        # Verificar que el field exista si se proporciona
        if 'field_id' in data and data['field_id']:
            field = Field.query.get(data['field_id'])
            if not field:
                return jsonify({"msg": "La finca especificada no existe"}), 400
        
        # Crear nuevo staff
        staff = Staff(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone', ''),
            position=data['position'],
            salary=data.get('salary'),
            status=data.get('status', 'Activo'),
            notes=data.get('notes', ''),
            field_id=data.get('field_id'),
            user_id=current_user_id
        )
        
        # Procesar hire_date si se proporciona
        if 'hire_date' in data and data['hire_date']:
            staff.hire_date = datetime.strptime(data['hire_date'], '%Y-%m-%d').date()
        
        db.session.add(staff)
        db.session.commit()
        
        return jsonify(staff.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al crear el personal", "error": str(e)}), 500

@api.route('/staff/<int:staff_id>', methods=['PUT'])
@jwt_required()
def update_staff(staff_id):
    """Actualizar personal"""
    try:
        staff = Staff.query.get(staff_id)
        if not staff:
            return jsonify({"msg": "Personal no encontrado"}), 404
        
        data = request.get_json()
        
        # Verificar que el field exista si se proporciona
        if 'field_id' in data and data['field_id']:
            field = Field.query.get(data['field_id'])
            if not field:
                return jsonify({"msg": "La finca especificada no existe"}), 400
        
        # Actualizar campos
        staff.name = data.get('name', staff.name)
        staff.email = data.get('email', staff.email)
        staff.phone = data.get('phone', staff.phone)
        staff.position = data.get('position', staff.position)
        staff.salary = data.get('salary', staff.salary)
        staff.status = data.get('status', staff.status)
        staff.notes = data.get('notes', staff.notes)
        staff.field_id = data.get('field_id', staff.field_id)
        
        # Procesar hire_date si se proporciona
        if 'hire_date' in data and data['hire_date']:
            staff.hire_date = datetime.strptime(data['hire_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return jsonify(staff.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al actualizar el personal", "error": str(e)}), 500

@api.route('/staff/<int:staff_id>', methods=['DELETE'])
@jwt_required()
def delete_staff(staff_id):
    """Eliminar personal"""
    try:
        staff = Staff.query.get(staff_id)
        if not staff:
            return jsonify({"msg": "Personal no encontrado"}), 404
        
        db.session.delete(staff)
        db.session.commit()
        return jsonify({"msg": "Personal eliminado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error al eliminar el personal", "error": str(e)}), 500

# ============================
# CLIMA API
# ============================
@api.route('/weather/<city>', methods=['GET'])
@jwt_required()
def get_weather(city):
    """Obtener el clima actual de una ciudad usando Open-Meteo API con fallback"""
    try:
        # Lista de ciudades colombianas importantes con coordenadas conocidas
        colombian_cities = {
            'boyaca': {'lat': 5.5353, 'lon': -73.3678, 'name': 'Boyacá', 'country': 'Colombia'},
            'tunja': {'lat': 5.5353, 'lon': -73.3678, 'name': 'Tunja', 'country': 'Colombia'},
            'bogota': {'lat': 4.7110, 'lon': -74.0721, 'name': 'Bogotá', 'country': 'Colombia'},
            'medellin': {'lat': 6.2442, 'lon': -75.5812, 'name': 'Medellín', 'country': 'Colombia'},
            'cali': {'lat': 3.4516, 'lon': -76.5319, 'name': 'Cali', 'country': 'Colombia'},
            'barranquilla': {'lat': 10.9639, 'lon': -74.7964, 'name': 'Barranquilla', 'country': 'Colombia'},
            'cartagena': {'lat': 10.3910, 'lon': -75.4794, 'name': 'Cartagena', 'country': 'Colombia'},
            'bucaramanga': {'lat': 7.1253, 'lon': -73.1198, 'name': 'Bucaramanga', 'country': 'Colombia'},
            'pereira': {'lat': 4.8133, 'lon': -75.6961, 'name': 'Pereira', 'country': 'Colombia'},
            'cucuta': {'lat': 7.8939, 'lon': -72.5078, 'name': 'Cúcuta', 'country': 'Colombia'},
            'ibague': {'lat': 4.4389, 'lon': -75.2322, 'name': 'Ibagué', 'country': 'Colombia'},
            'villavicencio': {'lat': 4.1505, 'lon': -73.6367, 'name': 'Villavicencio', 'country': 'Colombia'},
            'valledupar': {'lat': 10.4634, 'lon': -73.2532, 'name': 'Valledupar', 'country': 'Colombia'},
            'monteria': {'lat': 8.7479, 'lon': -75.8815, 'name': 'Montería', 'country': 'Colombia'},
            'neiva': {'lat': 2.9273, 'lon': -75.2819, 'name': 'Neiva', 'country': 'Colombia'},
            'pasto': {'lat': 1.2136, 'lon': -77.2811, 'name': 'Pasto', 'country': 'Colombia'},
            'riohacha': {'lat': 11.5444, 'lon': -72.9070, 'name': 'Riohacha', 'country': 'Colombia'},
            'armenia': {'lat': 4.5339, 'lon': -75.6811, 'name': 'Armenia', 'country': 'Colombia'},
            'popayan': {'lat': 2.4542, 'lon': -76.6147, 'name': 'Popayán', 'country': 'Colombia'},
            'sincelejo': {'lat': 9.3047, 'lon': -75.3973, 'name': 'Sincelejo', 'country': 'Colombia'}
        }
        
        # Normalizar nombre de ciudad para búsqueda
        city_lower = city.lower().strip()
        
        # Primero intentamos obtener coordenadas de la ciudad con Open-Meteo
        geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=es&format=json"
        geo_response = requests.get(geocoding_url)
        
        lat, lon, city_name, country = None, None, None, None
        
        # Si Open-Meteo encuentra la ciudad
        if geo_response.status_code == 200:
            geo_data = geo_response.json()
            if geo_data.get('results'):
                lat = geo_data['results'][0]['latitude']
                lon = geo_data['results'][0]['longitude']
                city_name = geo_data['results'][0]['name']
                country = geo_data['results'][0]['country']
        
        # Si no encuentra, intentar con nuestro fallback de ciudades colombianas
        if lat is None and city_lower in colombian_cities:
            city_data = colombian_cities[city_lower]
            lat = city_data['lat']
            lon = city_data['lon']
            city_name = city_data['name']
            country = city_data['country']
            print(f"Using fallback coordinates for {city}: {lat}, {lon}")
        
        # Si todavía no hay coordenadas, usar Bogotá como último fallback
        if lat is None:
            lat = 4.7110  # Bogotá
            lon = -74.0721
            city_name = city or 'Ubicación'
            country = 'Colombia'
            print(f"Using Bogotá as final fallback for {city}")
        
        # Obtener clima actual
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        weather_response = requests.get(weather_url)
        
        if weather_response.status_code != 200:
            return jsonify({"msg": "Error al obtener datos del clima"}), 400
            
        weather_data = weather_response.json()
        
        # Procesar datos del clima
        current = weather_data.get('current_weather', {})
        daily = weather_data.get('daily', {})
        
        weather_info = {
            "city": city_name,
            "country": country,
            "latitude": lat,
            "longitude": lon,
            "current": {
                "temperature": current.get('temperature'),
                "windspeed": current.get('windspeed'),
                "winddirection": current.get('winddirection'),
                "is_day": current.get('is_day'),
                "weather_code": current.get('weathercode'),
                "time": current.get('time')
            },
            "daily": {
                "max_temp": daily.get('temperature_2m_max', [])[0] if daily.get('temperature_2m_max') else None,
                "min_temp": daily.get('temperature_2m_min', [])[0] if daily.get('temperature_2m_min') else None,
                "precipitation": daily.get('precipitation_sum', [])[0] if daily.get('precipitation_sum') else None
            }
        }
        
        return jsonify(weather_info), 200
        
    except Exception as e:
        return jsonify({"msg": "Error al obtener el clima", "error": str(e)}), 500

@api.route('/weather/coordinates', methods=['POST'])
@jwt_required()
def get_weather_by_coordinates():
    """Obtener el clima actual usando coordenadas específicas"""
    try:
        data = request.get_json()
        lat = data.get('latitude')
        lon = data.get('longitude')
        
        if not lat or not lon:
            return jsonify({"msg": "Latitud y longitud son requeridas"}), 400
            
        # Obtener clima actual
        weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        weather_response = requests.get(weather_url)
        
        if weather_response.status_code != 200:
            return jsonify({"msg": "Error al obtener datos del clima"}), 400
            
        weather_data = weather_response.json()
        
        # Procesar datos del clima
        current = weather_data.get('current_weather', {})
        daily = weather_data.get('daily', {})
        
        weather_info = {
            "latitude": lat,
            "longitude": lon,
            "current": {
                "temperature": current.get('temperature'),
                "windspeed": current.get('windspeed'),
                "winddirection": current.get('winddirection'),
                "is_day": current.get('is_day'),
                "weather_code": current.get('weathercode'),
                "time": current.get('time')
            },
            "daily": {
                "max_temp": daily.get('temperature_2m_max', [])[0] if daily.get('temperature_2m_max') else None,
                "min_temp": daily.get('temperature_2m_min', [])[0] if daily.get('temperature_2m_min') else None,
                "precipitation": daily.get('precipitation_sum', [])[0] if daily.get('precipitation_sum') else None
            }
        }
        
        return jsonify(weather_info), 200
        
    except Exception as e:
        return jsonify({"msg": "Error al obtener el clima", "error": str(e)}), 500