#!/usr/bin/env python3
import os
import sys

# Agregar el directorio src al path Python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def create_admin():
    """Crear usuario administrador usando la API directamente"""
    import requests
    import json
    
    # URL de registro
    url = "http://127.0.0.1:3001/api/register"
    
    # Datos del usuario administrador
    admin_data = {
        "nombre": "Administrador",
        "correo": "admin@teledomofarm.com", 
        "contraseña": "admin123"
    }
    
    try:
        print("Creando usuario administrador...")
        response = requests.post(url, json=admin_data)
        
        if response.status_code == 201:
            print("Usuario administrador creado exitosamente!")
            print("   Email: admin@teledomofarm.com")
            print("   Contraseña: admin123")
            print("\nAhora puedes iniciar sesión en la aplicación")
            return True
        elif response.status_code == 400 and "ya existe" in response.text.lower():
            print("El usuario administrador ya existe")
            print("   Email: admin@teledomofarm.com")
            print("   Contraseña: admin123")
            print("\nPuedes iniciar sesión con estas credenciales")
            return True
        else:
            print(f"Error al crear usuario: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("Error: No se puede conectar al servidor backend")
        print("   Asegúrate de que el servidor Flask esté corriendo en http://127.0.0.1:3001")
        return False
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return False

if __name__ == "__main__":
    print("Configurando usuario administrador para TeleDomoFarm")
    print("=" * 50)
    
    # Crear usuario
    if create_admin():
        print("\nResumen:")
        print("   - Usuario: admin@teledomofarm.com")
        print("   - Contraseña: admin123")
        print("   - Backend: http://127.0.0.1:3001")
        print("   - Frontend: http://localhost:3000")
        print("\nAhora ve a http://localhost:3000 e inicia sesión con estas credenciales")
    else:
        print("\nNo se pudo completar la configuración")
        print("   Verifica que el servidor backend esté corriendo en el puerto 3001")
