#!/usr/bin/env python3
"""
Script para añadir las columnas staff_id a las tablas existentes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.app import app
from src.api.models import db
from sqlalchemy import text

def add_staff_columns():
    """Añadir columnas staff_id a las tablas inventory y equipment"""
    
    with app.app_context():
        print("Añadiendo columnas staff_id...")
        
        try:
            # Añadir columna staff_id a la tabla inventory
            db.session.execute(text("""
                ALTER TABLE inventory ADD COLUMN staff_id INTEGER;
            """))
            print("Columna staff_id añadida a inventory")
            
            # Añadir columna staff_id a la tabla equipment
            db.session.execute(text("""
                ALTER TABLE equipment ADD COLUMN staff_id INTEGER;
            """))
            print("Columna staff_id añadida a equipment")
            
            db.session.commit()
            print("Columnas añadidas exitosamente!")
            
        except Exception as e:
            print(f"Error al añadir columnas: {e}")
            db.session.rollback()
            return False
            
    return True

if __name__ == "__main__":
    add_staff_columns()
