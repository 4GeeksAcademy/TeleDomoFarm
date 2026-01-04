import os
from flask_admin.contrib.sqla import ModelView
from flask_admin import Admin
from src.api.models import db, User, Field, Equipment, Inventory

# Clases personalizadas para cada modelo
class UserAdminView(ModelView):
    column_list = ('id', 'email', 'first_name', 'last_name', 'is_active', 'role')
    column_searchable_list = ['email', 'first_name', 'last_name']
    column_filters = ['is_active', 'role']
    form_columns = ['email', 'password', 'first_name', 'last_name', 'is_active', 'role']
    form_excluded_columns = ['created_at', 'updated_at']
    
    def on_model_change(self, form, model, is_created):
        if 'password' in form:
            model.password = generate_password_hash(form.password.data)
        return super().on_model_change(form, model, is_created)

class FieldAdminView(ModelView):
    column_list = ('id', 'name', 'crop', 'area', 'status', 'next_action')
    column_searchable_list = ['name', 'crop']
    column_filters = ['status']
    form_columns = ['name', 'crop', 'area', 'status', 'next_action']
    form_excluded_columns = ['created_at', 'updated_at', 'equipment', 'inventory']

class EquipmentAdminView(ModelView):
    column_list = ('id', 'name', 'type', 'status', 'field')
    column_searchable_list = ['name', 'type', 'model']
    column_filters = ['status', 'type']
    form_columns = ['name', 'type', 'brand', 'model', 'year', 'status', 'field']
    form_excluded_columns = ['created_at', 'updated_at']

class InventoryAdminView(ModelView):
    column_list = ('id', 'name', 'category', 'quantity', 'unit', 'field')
    column_searchable_list = ['name', 'category', 'supplier']
    column_filters = ['category', 'unit']
    form_columns = ['name', 'category', 'quantity', 'unit', 'supplier', 'min_quantity', 'notes', 'field']
    form_excluded_columns = ['created_at', 'updated_at']

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='TeleDomoFarm Admin')
    
    # Añadir vistas personalizadas
    admin.add_view(ModelView(User, db.session, name='Usuarios', category='Administración'))
    admin.add_view(ModelView(Field, db.session, name='Campos', category='Administración'))
    admin.add_view(ModelView(Equipment, db.session, name='Equipos', category='Inventario'))
    admin.add_view(ModelView(Inventory, db.session, name='Inventario', category='Inventario'))