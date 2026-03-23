#  Sistema SaludPlus

## 1. Diagrama del Core

Este diagrama muestra un único proceso central (óvalo) que representa el sistema completo y los actores del negocio conectados a él.

![Diagrama1](img/diagrama1.png)

### Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| **Paciente** | Usuario que utiliza la plataforma para registrarse, buscar médicos disponibles, consultar horarios y programar citas médicas. |
| **Médico** | Profesional de salud que utiliza el sistema para gestionar su agenda, definir horarios disponibles y atender pacientes mediante citas programadas. |
| **Administrador** | Usuario encargado de supervisar el sistema, aprobar registros de usuarios, administrar cuentas y generar reportes del funcionamiento del sistema. |

---

## Descripción Formal del Core

El sistema **SaludPlus** es una plataforma diseñada para gestionar el proceso de programación y administración de citas médicas entre pacientes y médicos dentro de una clínica. 

- **Para pacientes**: Permite registrarse, iniciar sesión, consultar médicos disponibles y programar citas médicas según los horarios establecidos por los médicos.
- **Para médicos**: Pueden gestionar sus horarios de atención y registrar la atención brindada a los pacientes durante las citas programadas.
- **Para administrador**: Supervisa el funcionamiento general de la plataforma, aprobando usuarios registrados, administrando cuentas y generando reportes sobre el uso del sistema.

> **Valor principal del sistema**: Mejorar la eficiencia en la gestión de citas médicas, facilitar la organización de horarios y mejorar la comunicación entre pacientes, médicos y la administración de la clínica.

---

## Diagrama de Primera Descomposición

![Diagrama1](img/diagrama2.png)

### Descripción de los Procesos del Negocio

#### Registrarse Paciente
- **Descripción**: Permite a un paciente crear una cuenta dentro del sistema proporcionando sus datos personales para poder acceder a los servicios de la plataforma.
- **Actores**: Paciente

#### Registrarse Médico
- **Descripción**: Permite a un médico registrarse en el sistema proporcionando su información personal y profesional para poder ofrecer consultas médicas dentro de la plataforma.
- **Actores**: Médico

#### Iniciar Sesión
- **Descripción**: Proceso mediante el cual los usuarios registrados acceden al sistema utilizando su correo electrónico y contraseña.
- **Actores**: Paciente, Médico, Administrador

#### Programar Cita
- **Descripción**: Permite al paciente seleccionar un médico disponible y reservar una cita médica según los horarios disponibles.
- **Actores**: Paciente

#### Cancelar Cita
- **Descripción**: Permite al paciente cancelar una cita previamente programada dentro del sistema.
- **Actores**: Paciente

#### Atender Paciente
- **Descripción**: Permite al médico registrar la atención brindada a un paciente durante una cita médica programada.
- **Actores**: Médico

#### Gestionar Horarios Médicos
- **Descripción**: Permite al médico definir y administrar los horarios en los que estará disponible para atender pacientes.
- **Actores**: Médico

#### Aprobar Usuarios
- **Descripción**: Permite al administrador revisar y aprobar los registros de médicos y pacientes en el sistema.
- **Actores**: Administrador

#### Generar Reportes
- **Descripción**: Permite al administrador generar reportes relacionados con citas médicas, usuarios registrados y uso del sistema.
- **Actores**: Administrador

---

## Documentación de Casos de Uso

### CDU 1 — Registrarse Paciente
| Campo | Detalle |
|-------|---------|
| **Nombre** | Registrarse Paciente |
| **Actor principal** | Paciente |
| **Descripción** | Permite a un paciente crear una cuenta en el sistema proporcionando sus datos personales para poder acceder a la plataforma y solicitar citas médicas. |
| **Precondiciones** | • El paciente no debe estar registrado previamente. |
| **Flujo principal** | 1. El paciente accede a la opción registrarse.<br>2. Ingresa sus datos personales.<br>3. El sistema valida la información.<br>4. El sistema guarda la información del paciente.<br>5. El sistema confirma el registro. |
| **Postcondición** | • El paciente queda registrado en el sistema con estado pendiente o activo. |

---

### CDU 2 — Registrarse Médico
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Médico |
| **Descripción** | Permite a un médico registrarse en la plataforma proporcionando su información personal y profesional para ofrecer servicios médicos. |
| **Precondiciones** | • El médico no debe estar registrado. |
| **Flujo principal** | 1. El médico accede a la opción de registro.<br>2. Ingresa información personal y profesional.<br>3. El sistema valida los datos.<br>4. El sistema guarda la información.<br>5. El registro queda pendiente de aprobación. |
| **Postcondición** | • El médico queda registrado con estado pendiente. |

---

### CDU 3 — Iniciar Sesión
| Campo | Detalle |
|-------|---------|
| **Actores** | • Paciente<br>• Médico<br>• Administrador |
| **Descripción** | Permite a los usuarios acceder al sistema mediante sus credenciales registradas. |
| **Precondiciones** | • El usuario debe estar registrado. |
| **Flujo principal** | 1. El usuario ingresa correo y contraseña.<br>2. El sistema valida las credenciales.<br>3. El sistema verifica el estado del usuario.<br>4. El sistema permite el acceso. |
| **Postcondición** | • El usuario accede al sistema. |

---

### CDU 4 — Programar Cita
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Paciente |
| **Descripción** | Permite al paciente seleccionar un médico disponible y programar una cita médica según los horarios disponibles. |
| **Precondiciones** | • El paciente debe estar autenticado.<br>• El médico debe tener horarios disponibles. |
| **Flujo principal** | 1. El paciente busca médicos disponibles.<br>2. Selecciona un médico.<br>3. El sistema muestra horarios disponibles.<br>4. El paciente selecciona un horario.<br>5. El sistema registra la cita. |
| **Postcondición** | • La cita queda registrada en el sistema. |

---

### CDU 5 — Cancelar Cita
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Paciente |
| **Descripción** | Permite al paciente cancelar una cita previamente programada. |
| **Precondiciones** | • La cita debe existir. |
| **Flujo principal** | 1. El paciente visualiza sus citas.<br>2. Selecciona la cita.<br>3. Selecciona cancelar.<br>4. El sistema actualiza el estado de la cita. |
| **Postcondición** | • La cita queda cancelada. |

---

### CDU 6 — Atender Paciente
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Médico |
| **Descripción** | Permite al médico registrar la atención médica realizada durante una cita programada. |
| **Precondiciones** | • Debe existir una cita programada. |
| **Flujo principal** | 1. El médico visualiza sus citas del día.<br>2. Selecciona una cita.<br>3. Registra diagnóstico o tratamiento.<br>4. El sistema guarda la información. |
| **Postcondición** | • La atención queda registrada. |

---

### CDU 7 — Gestionar Horarios Médicos
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Médico |
| **Descripción** | Permite al médico definir los horarios en los que estará disponible para atender pacientes. |
| **Precondiciones** | • El médico debe estar autenticado. |
| **Flujo principal** | 1. El médico accede a gestión de horarios.<br>2. Define días y horas disponibles.<br>3. El sistema guarda la información. |
| **Postcondición** | • Los horarios quedan disponibles para los pacientes. |

---

### CDU 8 — Aprobar Usuarios
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Administrador |
| **Descripción** | Permite al administrador aprobar o rechazar registros de médicos y pacientes. |
| **Precondiciones** | • Debe existir un usuario pendiente. |
| **Flujo principal** | 1. El administrador visualiza usuarios pendientes.<br>2. Revisa la información.<br>3. Aprueba o rechaza el usuario.<br>4. El sistema actualiza el estado. |
| **Postcondición** | • El usuario queda activo o rechazado. |

---

### CDU 9 — Generar Reportes
| Campo | Detalle |
|-------|---------|
| **Actor principal** | Administrador |
| **Descripción** | Permite al administrador generar reportes del uso del sistema, como número de citas, médicos registrados y pacientes activos. |
| **Precondiciones** | • El administrador debe estar autenticado. |
| **Flujo principal** | 1. El administrador accede al módulo de reportes.<br>2. Selecciona el tipo de reporte.<br>3. El sistema genera el reporte. |
| **Postcondición** | • El reporte se muestra o se descarga. |
