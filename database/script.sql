CREATE TABLE usuarios (
id SERIAL PRIMARY KEY,
nombre VARCHAR(100),
correo VARCHAR(100),
password TEXT
);

CREATE TABLE medicos (
id SERIAL PRIMARY KEY,
nombre VARCHAR(100),
especialidad VARCHAR(100)
);

CREATE TABLE horarios (
id SERIAL PRIMARY KEY,
medico_id INT,
fecha DATE,
hora TIME,
disponible BOOLEAN
);

CREATE TABLE citas (
id SERIAL PRIMARY KEY,
usuario_id INT,
medico_id INT,
fecha DATE,
hora TIME,
estado VARCHAR(50)
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dpi VARCHAR(13) UNIQUE NOT NULL,
    genero VARCHAR(10) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    fotografia TEXT,
    correo VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente'
);

select * from usuarios

