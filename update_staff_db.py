#!/usr/bin/env python3
"""
Script para actualizar la base de datos con el nuevo modelo Staff
y las nuevas relaciones en Inventory y Equipment
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar la aplicación primero
from src.app import app
from src.api.models import db, Staff, Inventory, Equipment, Field

def update_database():
    """Actualizar la base de datos con las nuevas tablas y relaciones"""
    
    with app.app_context():
        print("Actualizando base de datos...")
        
        try:
            # Crear todas las tablas nuevas
            db.create_all()
            print("Tablas creadas/actualizadas correctamente")
            
            # Verificar si la tabla staff existe
            staff_count = Staff.query.count()
            print(f"Personal actual en la base de datos: {staff_count}")
            
            # Verificar relaciones en inventory
            inventory_with_staff = Inventory.query.filter(Inventory.staff_id.isnot(None)).count()
            print(f"Items de inventario con personal asignado: {inventory_with_staff}")
            
            # Verificar relaciones en equipment  
            equipment_with_staff = Equipment.query.filter(Equipment.staff_id.isnot(None)).count()
            print(f"Equipos con personal asignado: {equipment_with_staff}")
            
            print("Base de datos actualizada exitosamente!")
            
        except Exception as e:
            print(f"Error al actualizar la base de datos: {e}")
            return False
            
    return True

if __name__ == "__main__":
    update_database()
