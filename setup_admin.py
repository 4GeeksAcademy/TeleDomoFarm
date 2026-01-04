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
        print("🔐 Creando usuario administrador...")
        response = requests.post(url, json=admin_data)
        
        if response.status_code == 201:
            print("✅ Usuario administrador creado exitosamente!")
            print("   Email: admin@teledomofarm.com")
            print("   Contraseña: admin123")
            print("\n🚀 Ahora puedes iniciar sesión en la aplicación")
            return True
        elif response.status_code == 400 and "ya existe" in response.text.lower():
            print("✅ El usuario administrador ya existe")
            print("   Email: admin@teledomofarm.com")
            print("   Contraseña: admin123")
            print("\n🚀 Puedes iniciar sesión con estas credenciales")
            return True
        else:
            print(f"❌ Error al crear usuario: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servidor backend")
        print("   Asegúrate de que el servidor Flask esté corriendo en http://127.0.0.1:3001")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        return False

def login_admin():
    """Iniciar sesión y obtener token"""
    import requests
    
    url = "http://127.0.0.1:3001/api/login"
    
    login_data = {
        "correo": "admin@teledomofarm.com",
        "contraseña": "admin123"
    }
    
    try:
        print("\n🔑 Iniciando sesión...")
        response = requests.post(url, json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('access_token'):
                print("✅ Sesión iniciada exitosamente!")
                print(f"   Token: {data['access_token'][:50]}...")
                return data['access_token']
        else:
            print(f"❌ Error al iniciar sesión: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error al iniciar sesión: {str(e)}")
        return None

if __name__ == "__main__":
    print("🚀 Configurando usuario administrador para TeleDomoFarm")
    print("=" * 50)
    
    # Crear usuario
    if create_admin():
        # Intentar iniciar sesión
        token = login_admin()
        if token:
            print(f"\n✅ Todo listo! Token guardado en localStorage automáticamente")
            print("\n📋 Resumen:")
            print("   - Usuario: admin@teledomofarm.com")
            print("   - Contraseña: admin123")
            print("   - Backend: http://127.0.0.1:3001")
            print("   - Frontend: http://localhost:3000")
            print("\n🔄 Ahora refresca la página y deberías poder acceder al módulo de personal")
    else:
        print("\n❌ No se pudo completar la configuración")
        print("   Verifica que el servidor backend esté corriendo en el puerto 3001")
