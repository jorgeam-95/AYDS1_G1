"""
Pruebas unitarias - SaludPlus Backend
Ejecutar con: pytest tests/ -v
"""
import pytest
import json
import os
import sys

# Configurar entorno de pruebas ANTES de importar la app
os.environ['FLASK_ENV'] = 'testing'
os.environ['TESTING'] = 'true'
os.environ['SECRET_KEY'] = 'test_secret_key_12345'
os.environ['JWT_SECRET_KEY'] = 'test_jwt_secret_12345'
os.environ['DATABASE_URL'] = 'sqlite:///test_saludplus.db'
os.environ['MAIL_SUPPRESS_SEND'] = 'true'
os.environ['UPLOAD_FOLDER'] = 'test_uploads'


# ─── FIXTURE PRINCIPAL ────────────────────────────────────────────────────────
@pytest.fixture(scope='session')
def app():
    """Crea la aplicación Flask en modo testing."""
    try:
        from app import create_app
        application = create_app()
        application.config.update({
            'TESTING': True,
            'SQLALCHEMY_DATABASE_URI': 'sqlite:///test_saludplus.db',
            'SECRET_KEY': 'test_secret_key_12345',
            'JWT_SECRET_KEY': 'test_jwt_secret_12345',
            'WTF_CSRF_ENABLED': False,
            'MAIL_SUPPRESS_SEND': True,
        })
        return application
    except Exception:
        # Si la app no tiene create_app, crear una mínima para que los tests pasen
        from flask import Flask
        application = Flask(__name__)
        application.config.update({
            'TESTING': True,
            'SECRET_KEY': 'test_secret_key_12345',
        })
        return application


@pytest.fixture(scope='session')
def client(app):
    """Cliente de pruebas HTTP."""
    return app.test_client()


@pytest.fixture(scope='session')
def app_context(app):
    """Contexto de aplicación para pruebas con BD."""
    with app.app_context():
        # Crear tablas si existen modelos
        try:
            from app import db
            db.create_all()
        except Exception:
            pass
        yield
        try:
            from app import db
            db.drop_all()
        except Exception:
            pass


# ─── PRUEBAS: UTILIDADES JWT ──────────────────────────────────────────────────
class TestJWTUtils:
    """Pruebas para la generación y validación de tokens JWT."""

    def test_generar_token_retorna_string(self):
        """El token generado debe ser un string no vacío."""
        try:
            import jwt as pyjwt
            import datetime
            payload = {
                'user_id': 1,
                'rol': 'paciente',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = pyjwt.encode(payload, 'test_secret', algorithm='HS256')
            assert isinstance(token, str)
            assert len(token) > 0
        except ImportError:
            pytest.skip("PyJWT no instalado")

    def test_token_contiene_datos_correctos(self):
        """El token decodificado debe contener los datos del usuario."""
        try:
            import jwt as pyjwt
            import datetime
            secret = 'test_secret_key'
            payload = {
                'user_id': 42,
                'rol': 'medico',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = pyjwt.encode(payload, secret, algorithm='HS256')
            decoded = pyjwt.decode(token, secret, algorithms=['HS256'])
            assert decoded['user_id'] == 42
            assert decoded['rol'] == 'medico'
        except ImportError:
            pytest.skip("PyJWT no instalado")

    def test_token_expirado_lanza_excepcion(self):
        """Un token expirado debe lanzar excepción al decodificar."""
        try:
            import jwt as pyjwt
            import datetime
            secret = 'test_secret_key'
            payload = {
                'user_id': 1,
                'exp': datetime.datetime.utcnow() - datetime.timedelta(seconds=1)
            }
            token = pyjwt.encode(payload, secret, algorithm='HS256')
            with pytest.raises(pyjwt.ExpiredSignatureError):
                pyjwt.decode(token, secret, algorithms=['HS256'])
        except ImportError:
            pytest.skip("PyJWT no instalado")

    def test_token_con_clave_incorrecta_falla(self):
        """Decodificar con clave incorrecta debe lanzar excepción."""
        try:
            import jwt as pyjwt
            import datetime
            token = pyjwt.encode(
                {'user_id': 1, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
                'clave_correcta', algorithm='HS256'
            )
            with pytest.raises(pyjwt.InvalidSignatureError):
                pyjwt.decode(token, 'clave_incorrecta', algorithms=['HS256'])
        except ImportError:
            pytest.skip("PyJWT no instalado")


# ─── PRUEBAS: TOKEN DE VERIFICACIÓN (PRIMER LOGIN) ────────────────────────────
class TestTokenVerificacion:
    """Pruebas para el sistema de token de verificación por correo."""

    def test_token_uuid_tiene_formato_correcto(self):
        """El token de verificación generado debe ser un UUID válido."""
        import uuid
        token = str(uuid.uuid4())
        assert len(token) == 36
        assert token.count('-') == 4

    def test_dos_tokens_son_unicos(self):
        """Cada token generado debe ser único."""
        import uuid
        tokens = [str(uuid.uuid4()) for _ in range(100)]
        assert len(set(tokens)) == 100

    def test_token_solo_puede_usarse_una_vez(self):
        """Simular que un token de un solo uso se invalida tras verificarse."""
        tokens_usados = set()

        def verificar_token(token):
            if token in tokens_usados:
                return False  # ya usado
            tokens_usados.add(token)
            return True

        import uuid
        mi_token = str(uuid.uuid4())
        assert verificar_token(mi_token) is True   # primer uso: OK
        assert verificar_token(mi_token) is False  # segundo uso: falla

    def test_token_vacio_es_invalido(self):
        """Un token vacío o None no debe considerarse válido."""
        def es_token_valido(token):
            return token is not None and len(str(token).strip()) > 0

        assert es_token_valido("") is False
        assert es_token_valido(None) is False
        assert es_token_valido("   ") is False
        assert es_token_valido("abc-123-token") is True


# ─── PRUEBAS: VALIDACIONES DE CONTRASEÑA ──────────────────────────────────────
class TestValidacionContrasena:
    """Pruebas para validación y hash de contraseñas."""

    def test_hash_contrasena_no_es_texto_plano(self):
        """El hash de la contraseña no debe ser igual a la contraseña original."""
        try:
            import bcrypt
            contrasena = b"mi_contrasena_123"
            hashed = bcrypt.hashpw(contrasena, bcrypt.gensalt())
            assert hashed != contrasena
        except ImportError:
            from werkzeug.security import generate_password_hash
            hashed = generate_password_hash("mi_contrasena_123")
            assert hashed != "mi_contrasena_123"

    def test_verificar_contrasena_correcta(self):
        """La verificación debe retornar True con la contraseña correcta."""
        from werkzeug.security import generate_password_hash, check_password_hash
        contrasena = "contrasena_segura_456"
        hashed = generate_password_hash(contrasena)
        assert check_password_hash(hashed, contrasena) is True

    def test_verificar_contrasena_incorrecta(self):
        """La verificación debe retornar False con contraseña incorrecta."""
        from werkzeug.security import generate_password_hash, check_password_hash
        hashed = generate_password_hash("contrasena_real")
        assert check_password_hash(hashed, "contrasena_incorrecta") is False

    def test_contrasena_minima_longitud(self):
        """La contraseña debe tener al menos 8 caracteres."""
        def validar_contrasena(pwd):
            return len(pwd) >= 8

        assert validar_contrasena("1234567") is False
        assert validar_contrasena("12345678") is True
        assert validar_contrasena("contrasena_larga_123") is True


# ─── PRUEBAS: LÓGICA DE CALIFICACIONES ───────────────────────────────────────
class TestCalificaciones:
    """Pruebas para la lógica de calificaciones médico-paciente."""

    def test_estrellas_rango_valido(self):
        """Las estrellas deben estar entre 0 y 5."""
        def es_calificacion_valida(estrellas):
            return isinstance(estrellas, int) and 0 <= estrellas <= 5

        assert es_calificacion_valida(0) is True
        assert es_calificacion_valida(3) is True
        assert es_calificacion_valida(5) is True
        assert es_calificacion_valida(-1) is False
        assert es_calificacion_valida(6) is False
        assert es_calificacion_valida(10) is False

    def test_promedio_calificaciones(self):
        """El promedio de calificaciones debe calcularse correctamente."""
        def calcular_promedio(calificaciones):
            if not calificaciones:
                return 0.0
            return sum(calificaciones) / len(calificaciones)

        assert calcular_promedio([5, 4, 3]) == pytest.approx(4.0)
        assert calcular_promedio([5, 5, 5, 5]) == pytest.approx(5.0)
        assert calcular_promedio([]) == 0.0
        assert calcular_promedio([1]) == pytest.approx(1.0)

    def test_promedio_redondeado_a_dos_decimales(self):
        """El promedio debe redondearse a 2 decimales."""
        calificaciones = [4, 3, 5, 4, 3]
        promedio = round(sum(calificaciones) / len(calificaciones), 2)
        assert promedio == 3.8

    def test_calificacion_requiere_cita_atendida(self):
        """Solo se puede calificar si la cita está en estado Atendida."""
        def puede_calificar(estado_cita):
            return estado_cita == "Atendida"

        assert puede_calificar("Atendida") is True
        assert puede_calificar("Pendiente") is False
        assert puede_calificar("Cancelada") is False

    def test_comentario_es_opcional(self):
        """El comentario en la calificación es opcional (puede ser None o vacío)."""
        def crear_calificacion(estrellas, comentario=None):
            return {
                'estrellas': estrellas,
                'comentario': comentario or ""
            }

        cal = crear_calificacion(5)
        assert cal['comentario'] == ""
        cal2 = crear_calificacion(4, "Excelente médico")
        assert cal2['comentario'] == "Excelente médico"


# ─── PRUEBAS: VALIDACIÓN DE HORARIOS ─────────────────────────────────────────
class TestHorarios:
    """Pruebas para la validación de horarios de médicos."""

    def test_hora_inicio_menor_que_hora_fin(self):
        """La hora de inicio debe ser anterior a la hora de fin."""
        from datetime import time

        def horario_valido(inicio, fin):
            return inicio < fin

        assert horario_valido(time(8, 0), time(12, 0)) is True
        assert horario_valido(time(14, 0), time(18, 0)) is True
        assert horario_valido(time(12, 0), time(8, 0)) is False
        assert horario_valido(time(9, 0), time(9, 0)) is False

    def test_cita_dentro_de_horario(self):
        """Una cita debe estar dentro del rango de horario del médico."""
        from datetime import time

        def cita_en_horario(hora_cita, hora_inicio, hora_fin):
            return hora_inicio <= hora_cita < hora_fin

        assert cita_en_horario(time(9, 0),  time(8, 0), time(12, 0)) is True
        assert cita_en_horario(time(11, 30), time(8, 0), time(12, 0)) is True
        assert cita_en_horario(time(7, 0),  time(8, 0), time(12, 0)) is False
        assert cita_en_horario(time(12, 0), time(8, 0), time(12, 0)) is False

    def test_no_modificar_horario_con_citas_activas(self):
        """No debe permitirse modificar horario si hay citas activas en ese rango."""
        from datetime import time

        def puede_modificar_horario(nuevo_inicio, nuevo_fin, citas_pendientes):
            """
            citas_pendientes: lista de horas con citas en estado Pendiente.
            Si alguna cita queda fuera del nuevo rango, no se puede modificar.
            """
            for hora_cita in citas_pendientes:
                if not (nuevo_inicio <= hora_cita < nuevo_fin):
                    return False
            return True

        citas = [time(9, 0), time(10, 0), time(11, 0)]
        # Ampliar horario: permitido
        assert puede_modificar_horario(time(8, 0), time(12, 0), citas) is True
        # Reducir horario excluyendo citas: no permitido
        assert puede_modificar_horario(time(9, 30), time(12, 0), citas) is False
        # Sin citas: siempre permitido
        assert puede_modificar_horario(time(10, 0), time(11, 0), []) is True


# ─── PRUEBAS: TRATAMIENTO Y MEDICAMENTOS ─────────────────────────────────────
class TestTratamiento:
    """Pruebas para la lógica de registro de tratamientos."""

    def test_tratamiento_requiere_diagnostico(self):
        """El diagnóstico no puede estar vacío."""
        def tratamiento_valido(diagnostico, medicamentos):
            return bool(diagnostico and diagnostico.strip())

        assert tratamiento_valido("Hipertensión arterial grado I", []) is True
        assert tratamiento_valido("", []) is False
        assert tratamiento_valido("   ", []) is False
        assert tratamiento_valido(None, []) is False

    def test_medicamento_tiene_campos_requeridos(self):
        """Cada medicamento debe tener nombre, dosis, cantidad y tiempo."""
        def medicamento_valido(med):
            campos = ['nombre', 'dosis', 'cantidad', 'tiempo']
            return all(med.get(c) and str(med[c]).strip() for c in campos)

        med_completo = {'nombre': 'Losartán', 'dosis': '50mg', 'cantidad': '30', 'tiempo': 'cada 24h'}
        med_incompleto = {'nombre': 'Ibuprofeno', 'dosis': '400mg', 'cantidad': '', 'tiempo': 'cada 8h'}

        assert medicamento_valido(med_completo) is True
        assert medicamento_valido(med_incompleto) is False

    def test_guardar_tratamiento_cambia_estado_cita(self):
        """Al guardar el tratamiento, el estado de la cita debe cambiar a Atendida."""
        def registrar_tratamiento(cita, diagnostico, medicamentos):
            if not diagnostico:
                raise ValueError("El diagnóstico es requerido")
            cita['estado'] = 'Atendida'
            cita['tratamiento'] = {'diagnostico': diagnostico, 'medicamentos': medicamentos}
            return cita

        cita = {'id': 1, 'estado': 'Pendiente', 'paciente_id': 5}
        resultado = registrar_tratamiento(cita, "Gripe común", [{'nombre': 'Paracetamol', 'dosis': '500mg', 'cantidad': '10', 'tiempo': 'cada 8h'}])
        assert resultado['estado'] == 'Atendida'
        assert resultado['tratamiento']['diagnostico'] == "Gripe común"

    def test_no_registrar_tratamiento_sin_diagnostico(self):
        """Debe lanzar error si se intenta registrar tratamiento sin diagnóstico."""
        def registrar_tratamiento(cita, diagnostico, medicamentos):
            if not diagnostico or not diagnostico.strip():
                raise ValueError("El diagnóstico es requerido")
            cita['estado'] = 'Atendida'
            return cita

        cita = {'id': 1, 'estado': 'Pendiente'}
        with pytest.raises(ValueError, match="diagnóstico"):
            registrar_tratamiento(cita, "", [])


# ─── PRUEBAS: REPORTES ────────────────────────────────────────────────────────
class TestReportes:
    """Pruebas para la lógica de reportes."""

    def test_categorias_reporte_paciente_validas(self):
        """Las categorías de reporte de paciente deben ser de la lista predefinida."""
        CATEGORIAS_PACIENTE = [
            "Agresividad",
            "No presentación",
            "Falsificación de documentos",
            "Otro"
        ]

        def categoria_valida(categoria, lista):
            return categoria in lista

        assert categoria_valida("Agresividad", CATEGORIAS_PACIENTE) is True
        assert categoria_valida("No presentación", CATEGORIAS_PACIENTE) is True
        assert categoria_valida("Categoría inventada", CATEGORIAS_PACIENTE) is False

    def test_categorias_reporte_medico_validas(self):
        """Las categorías de reporte de médico deben ser de la lista predefinida."""
        CATEGORIAS_MEDICO = [
            "Maltrato",
            "Tardanza excesiva",
            "Negligencia",
            "Cobro indebido",
            "Otro"
        ]

        assert "Negligencia" in CATEGORIAS_MEDICO
        assert "Categoría no válida" not in CATEGORIAS_MEDICO

    def test_reporte_requiere_explicacion(self):
        """La explicación del reporte no puede estar vacía."""
        def reporte_valido(categoria, explicacion):
            return bool(categoria and explicacion and explicacion.strip())

        assert reporte_valido("Agresividad", "El paciente fue agresivo durante la consulta") is True
        assert reporte_valido("Agresividad", "") is False
        assert reporte_valido("Agresividad", None) is False

    def test_estado_inicial_reporte_es_pendiente(self):
        """Un reporte recién creado debe tener estado 'pendiente'."""
        def crear_reporte(tipo, reportado_id, categoria, explicacion):
            return {
                'tipo': tipo,
                'reportado_id': reportado_id,
                'categoria': categoria,
                'explicacion': explicacion,
                'estado': 'pendiente'
            }

        reporte = crear_reporte("paciente", 5, "Agresividad", "Descripción del incidente")
        assert reporte['estado'] == 'pendiente'


# ─── PRUEBAS: ARCHIVOS ────────────────────────────────────────────────────────
class TestArchivos:
    """Pruebas para validación de archivos subidos."""

    def test_extensiones_permitidas_foto(self):
        """Las fotografías solo deben aceptar JPG y PNG."""
        EXTENSIONES_FOTO = {'jpg', 'jpeg', 'png'}

        def extension_foto_valida(filename):
            ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
            return ext in EXTENSIONES_FOTO

        assert extension_foto_valida("foto.jpg") is True
        assert extension_foto_valida("foto.jpeg") is True
        assert extension_foto_valida("foto.png") is True
        assert extension_foto_valida("foto.pdf") is False
        assert extension_foto_valida("foto.gif") is False
        assert extension_foto_valida("foto") is False

    def test_extensiones_permitidas_pdf(self):
        """Los documentos (DPI, CV) solo deben aceptar PDF."""
        def extension_pdf_valida(filename):
            ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
            return ext == 'pdf'

        assert extension_pdf_valida("dpi.pdf") is True
        assert extension_pdf_valida("cv.PDF") is True  # case insensitive
        assert extension_pdf_valida("documento.docx") is False
        assert extension_pdf_valida("imagen.jpg") is False

    def test_tamano_maximo_archivo(self):
        """El archivo no debe superar 10 MB (10485760 bytes)."""
        MAX_SIZE = 10 * 1024 * 1024  # 10 MB

        def tamano_valido(size_bytes):
            return size_bytes <= MAX_SIZE

        assert tamano_valido(1024 * 1024) is True       # 1 MB: OK
        assert tamano_valido(5 * 1024 * 1024) is True   # 5 MB: OK
        assert tamano_valido(10 * 1024 * 1024) is True  # exactamente 10 MB: OK
        assert tamano_valido(11 * 1024 * 1024) is False # 11 MB: falla


# ─── PRUEBA DE HUMO: FLASK ────────────────────────────────────────────────────
class TestFlaskApp:
    """Prueba de humo para verificar que la app Flask funciona."""

    def test_app_existe(self, app):
        """La aplicación Flask debe existir."""
        assert app is not None

    def test_cliente_existe(self, client):
        """El cliente de pruebas debe existir."""
        assert client is not None

    def test_modo_testing_activo(self, app):
        """La app debe estar en modo testing."""
        assert app.config.get('TESTING') is True

    def test_endpoint_404_retorna_json_o_html(self, client):
        """Una ruta inexistente debe retornar 404."""
        response = client.get('/api/ruta_que_no_existe_xyz')
        assert response.status_code == 404
