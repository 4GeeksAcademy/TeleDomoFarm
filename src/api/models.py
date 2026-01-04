from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Integer, String, Text, Date, DateTime
from src.api.database import db


# ======================
# USER
# ======================
class User(UserMixin, db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones con los datos del usuario
    fields = db.relationship('Field', back_populates='user', cascade='all, delete-orphan')
    equipment = db.relationship('Equipment', back_populates='user', cascade='all, delete-orphan')
    inventory = db.relationship('Inventory', back_populates='user', cascade='all, delete-orphan')
    staff = db.relationship('Staff', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
            "is_active": self.is_active
        }


# ======================
# FIELD
# ======================
class Field(db.Model):
    __tablename__ = 'field'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200))
    size = db.Column(db.Float)
    crop = db.Column(db.String(100))
    area = db.Column(db.Float)
    status = db.Column(db.String(20), default='activo')
    next_action = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Añade default
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación con usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='fields')

    equipment_list = db.relationship(
        'Equipment',
        back_populates='field',
        cascade='all, delete-orphan'
    )
    inventory_list = db.relationship(
        'Inventory',
        back_populates='field',
        cascade='all, delete-orphan'
    )
    staff_list = db.relationship(
        'Staff',
        back_populates='field',
        cascade='all, delete-orphan'
    )
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "size": self.size,
            "crop": self.crop,
            "area": self.area,
            "status": self.status,
            "next_action": self.next_action,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


# ======================
# INVENTORY
# ======================
class Inventory(db.Model):
    __tablename__ = 'inventory'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, default=0)
    min_quantity = db.Column(db.Float, default=0)
    unit = db.Column(db.String(20))
    category = db.Column(db.String(50), default='general')
    supplier = db.Column(db.String(100))
    notes = db.Column(db.Text) 
    field_id = db.Column(db.Integer, db.ForeignKey('field.id'))

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    # Relación con usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='inventory')

    field = db.relationship('Field', back_populates='inventory_list')

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "min_quantity": self.min_quantity,
            "unit": self.unit,
            "category": self.category,
            "supplier": self.supplier,
            "notes": self.notes,  # Agregar esto
            "field_id": self.field_id,
            "field_name": self.field.name if self.field else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
# ======================
# EQUIPMENT
# ======================
class Equipment(db.Model):
    __tablename__ = 'equipment'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    brand = db.Column(db.String(50))
    model = db.Column(db.String(50))
    year = db.Column(Integer)
    serial_number = db.Column(db.String(100))
    purchase_date = db.Column(db.Date)
    status = db.Column(db.String(20), default='available')
    last_maintenance = db.Column(db.DateTime)
    next_maintenance = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    field_id = db.Column(db.Integer, db.ForeignKey('field.id'))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relación con usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='equipment')

    field = db.relationship('Field', back_populates='equipment_list')

    def serialize(self):
        return {
        "id": self.id,
        "name": self.name,
        "type": self.type,
        "brand": self.brand,
        "model": self.model,
        "year": self.year,
        "serial_number": self.serial_number,
        "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
        "status": self.status,
        "last_maintenance": self.last_maintenance.isoformat() if self.last_maintenance else None,
        "next_maintenance": self.next_maintenance.isoformat() if self.next_maintenance else None,
        "notes": self.notes,
        "field_id": self.field_id,
        "created_at": self.created_at.isoformat(),
        "updated_at": self.updated_at.isoformat()
    }

# ======================
# STAFF
# ======================
class Staff(db.Model):
    __tablename__ = 'staff'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    position = db.Column(db.String(50), nullable=False)
    hire_date = db.Column(db.Date, default=datetime.utcnow)
    salary = db.Column(db.Float)
    status = db.Column(db.String(20), default='Activo')
    notes = db.Column(db.Text)
    
    # Relación con Field
    field_id = db.Column(db.Integer, db.ForeignKey('field.id'))
    field = db.relationship('Field', back_populates='staff_list')
    
    # Relación con usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='staff')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "position": self.position,
            "hire_date": self.hire_date.isoformat() if self.hire_date else None,
            "salary": self.salary,
            "status": self.status,
            "notes": self.notes,
            "field_id": self.field_id,
            "field_name": self.field.name if self.field else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


