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


select * from usuarios