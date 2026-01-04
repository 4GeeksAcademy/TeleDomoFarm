#!/usr/bin/env python3
"""
Script para actualizar la base de datos con la nueva tabla equipment_staff
y la relación muchos-a-muchos entre Equipment y Staff
"""

import sys
import os

# Agregar el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.app import app, db
from src.api.models import equipment_staff

def update_equipment_staff_table():
    """Crear la tabla de asociación equipment_staff si no existe"""
    
    with app.app_context():
        try:
            print("Creando tabla equipment_staff...")
            
            # Crear la tabla de asociación
            equipment_staff.create(db.engine, checkfirst=True)
            
            print("Tabla equipment_staff creada exitosamente")
            
            # Verificar que la tabla existe
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            if 'equipment_staff' in tables:
                print("Verificacion: La tabla equipment_staff existe en la base de datos")
                print(f"Tablas en la base de datos: {tables}")
            else:
                print("Error: La tabla equipment_staff no se creo correctamente")
                return False
                
        except Exception as e:
            print(f"Error al crear la tabla equipment_staff: {e}")
            return False
    
    return True

if __name__ == "__main__":
    print("Iniciando actualizacion de la base de datos para Equipment-Staff...")
    print("=" * 60)
    
    success = update_equipment_staff_table()
    
    print("=" * 60)
    if success:
        print("Actualizacion completada exitosamente!")
        print("La relacion muchos-a-muchos entre Equipment y Staff esta lista")
    else:
        print("La actualizacion fallo. Revisa los errores anteriores.")
        sys.exit(1)
