"""
conftest.py - Configuración global de pytest para SaludPlus
"""
import pytest
import os

# Variables de entorno para testing
os.environ.setdefault('FLASK_ENV', 'testing')
os.environ.setdefault('TESTING', 'true')
os.environ.setdefault('SECRET_KEY', 'test_secret_key_12345')
os.environ.setdefault('JWT_SECRET_KEY', 'test_jwt_secret_12345')
os.environ.setdefault('DATABASE_URL', 'sqlite:///test_saludplus.db')
os.environ.setdefault('MAIL_SUPPRESS_SEND', 'true')


def pytest_configure(config):
    """Configuración inicial de pytest."""
    config.addinivalue_line(
        "markers", "unit: pruebas unitarias sin dependencias externas"
    )
    config.addinivalue_line(
        "markers", "integration: pruebas de integración con base de datos"
    )
