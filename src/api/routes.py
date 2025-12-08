from flask import request, jsonify
from api.models import db, User
from api.utils import APIException
from flask import Blueprint
from werkzeug.security import generate_password_hash

api = Blueprint('api', __name__)

# -------------------------------
# LOGIN
# -------------------------------
@api.route('/login', methods=['POST'])
def login():
    data = request.json
    
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email y contraseña son obligatorios"}), 400

    # Buscar usuario por email
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Validar contraseña
    if not check_password_hash(user.password, password):
        return jsonify({"error": "Contraseña incorrecta"}), 401

    # Si todo está bien, devolver datos del usuario
    return jsonify({
        "message": "Login exitoso",
        "user": {
            "id": user.id,
            "email": user.email,
            "rol": user.rol
        }
    }), 200

# -------------------------------
#  CREATE USER
# -------------------------------
@api.route('/users', methods=['POST'])
def crear_usuario():
    data = request.json

    nombre = data.get("nombre")
    correo = data.get("correo")
    contraseña = data.get("contraseña")
    rol = data.get("rol")

    if not nombre or not correo or not contraseña or not rol:
        return jsonify({"message": "Campos obligatorios faltantes"}), 400

    existente = User.query.filter_by(correo=correo).first()
    if existente:
        return jsonify({"message": "El correo ya está registrado"}), 409

    hash_pw = generate_password_hash(contraseña)

    nuevo = User(
        nombre=nombre,
        correo=correo,
        contraseña=hash_pw,
        rol=rol,
        is_active=True
    )

    db.session.add(nuevo)
    db.session.commit()

    return jsonify({
        "message": "User creado exitosamente",
        "usuario": nuevo.serialize()
    }), 201


# -------------------------------
#  GET ALL USERS
# -------------------------------
@api.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_serialized = [user.serialize() for user in users]
    return jsonify(users_serialized), 200


# -------------------------------
#  GET USER BY ID
# -------------------------------
@api.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User no encontrado"}), 404
    
    return jsonify(user.serialize()), 200


# -------------------------------
#  UPDATE USER
# -------------------------------
@api.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User no encontrado"}), 404

    data = request.json

    user.nombre = data.get("nombre", user.nombre)
    user.correo = data.get("correo", user.correo)
    user.rol = data.get("rol", user.rol)

    if "contraseña" in data:
        from werkzeug.security import generate_password_hash as gph
        user.contraseña = gph(data["contraseña"])

    db.session.commit()

    return jsonify({
        "message": "User actualizado",
        "usuario": user.serialize()
    }), 200


# -------------------------------
#  DELETE USER
# -------------------------------
@api.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User eliminado correctamente"}), 200
