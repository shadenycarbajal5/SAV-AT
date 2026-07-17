-- ============================================================
-- SAV-AT: Script de creación de base de datos (para hosting)
-- ============================================================

CREATE DATABASE IF NOT EXISTS sav_at;
USE sav_at;

-- ── Tablas de catálogo ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS rol(
 id_rol INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS categoria_cliente(
 id_categoria_cliente INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS categoria_producto(
 id_categoria_producto INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS proveedor(
 id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(150) NOT NULL,
 ruc VARCHAR(11) UNIQUE,
 telefono VARCHAR(20),
 correo VARCHAR(100),
 direccion VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS promocion(
 id_promocion INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(100),
 descripcion TEXT,
 fecha_inicio DATE,
 fecha_fin DATE,
 tipo_descuento ENUM('PORCENTAJE','MONTO_FIJO'),
 valor_descuento DECIMAL(10,2),
 estado BOOLEAN DEFAULT TRUE
);

-- ── Tablas principales ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS producto(
 id_producto INT AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(150) NOT NULL,
 descripcion TEXT,
 precio_venta DECIMAL(10,2),
 costo DECIMAL(10,2),
 stock INT DEFAULT 0,
 stock_minimo INT DEFAULT 0,
 codigo_barras VARCHAR(50) UNIQUE,
 tipo_producto ENUM('VENTA','REPUESTO'),
 estado BOOLEAN DEFAULT TRUE,
 id_categoria_producto INT,
 id_proveedor INT,
 FOREIGN KEY(id_categoria_producto) REFERENCES categoria_producto(id_categoria_producto),
 FOREIGN KEY(id_proveedor) REFERENCES proveedor(id_proveedor)
);

CREATE TABLE IF NOT EXISTS promocion_producto(
 id_promocion INT,
 id_producto INT,
 PRIMARY KEY(id_promocion,id_producto),
 FOREIGN KEY(id_promocion) REFERENCES promocion(id_promocion) ON DELETE CASCADE,
 FOREIGN KEY(id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cliente(
 id_cliente INT AUTO_INCREMENT PRIMARY KEY,
 nombres VARCHAR(150),
 dni_ruc VARCHAR(20) UNIQUE,
 telefono VARCHAR(20),
 correo VARCHAR(100),
 direccion VARCHAR(200),
 id_categoria_cliente INT,
 FOREIGN KEY(id_categoria_cliente) REFERENCES categoria_cliente(id_categoria_cliente)
);

CREATE TABLE IF NOT EXISTS usuario(
 id_usuario INT AUTO_INCREMENT PRIMARY KEY,
 nombres VARCHAR(150),
 username VARCHAR(50) UNIQUE,
 password VARCHAR(255),
 estado BOOLEAN DEFAULT TRUE,
 id_rol INT,
 FOREIGN KEY(id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE IF NOT EXISTS cotizacion(
 id_cotizacion INT AUTO_INCREMENT PRIMARY KEY,
 fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
 fecha_vencimiento DATE,
 estado ENUM('PENDIENTE','APROBADA','RECHAZADA','CONVERTIDA'),
 total DECIMAL(10,2),
 id_cliente INT,
 FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS detalle_cotizacion(
 id_detalle INT AUTO_INCREMENT PRIMARY KEY,
 id_cotizacion INT,
 id_producto INT,
 cantidad INT,
 precio_unitario DECIMAL(10,2),
 subtotal DECIMAL(10,2),
 FOREIGN KEY(id_cotizacion) REFERENCES cotizacion(id_cotizacion) ON DELETE CASCADE,
 FOREIGN KEY(id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE IF NOT EXISTS venta(
 id_venta INT AUTO_INCREMENT PRIMARY KEY,
 fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
 subtotal DECIMAL(10,2),
 descuento DECIMAL(10,2),
 total DECIMAL(10,2),
 metodo_pago ENUM('EFECTIVO','TARJETA','TRANSFERENCIA','YAPE','PLIN'),
 id_cliente INT,
 id_usuario INT,
 FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente),
 FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS detalle_venta(
 id_detalle INT AUTO_INCREMENT PRIMARY KEY,
 id_venta INT,
 id_producto INT,
 cantidad INT,
 precio_unitario DECIMAL(10,2),
 subtotal DECIMAL(10,2),
 FOREIGN KEY(id_venta) REFERENCES venta(id_venta) ON DELETE CASCADE,
 FOREIGN KEY(id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE IF NOT EXISTS equipo(
 id_equipo INT AUTO_INCREMENT PRIMARY KEY,
 marca VARCHAR(100),
 modelo VARCHAR(100),
 numero_serie VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS orden_servicio(
 id_os INT AUTO_INCREMENT PRIMARY KEY,
 fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
 fecha_entrega DATE,
 descripcion_problema TEXT,
 estado ENUM('RECIBIDO','DIAGNOSTICO','REPARACION','LISTO','ENTREGADO','CANCELADO'),
 id_cliente INT,
 id_usuario INT,
 id_equipo INT,
 FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente),
 FOREIGN KEY(id_usuario) REFERENCES usuario(id_usuario),
 FOREIGN KEY(id_equipo) REFERENCES equipo(id_equipo)
);

CREATE TABLE IF NOT EXISTS repuesto_os(
 id_repuesto_os INT AUTO_INCREMENT PRIMARY KEY,
 id_os INT,
 id_producto INT,
 cantidad INT,
 FOREIGN KEY(id_os) REFERENCES orden_servicio(id_os) ON DELETE CASCADE,
 FOREIGN KEY(id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE IF NOT EXISTS caja(
 id_caja INT AUTO_INCREMENT PRIMARY KEY,
 fecha_apertura DATETIME,
 fecha_cierre DATETIME,
 monto_inicial DECIMAL(10,2),
 monto_final DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS movimiento_caja(
 id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
 fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
 tipo ENUM('INGRESO','EGRESO'),
 descripcion VARCHAR(255),
 monto DECIMAL(10,2),
 id_caja INT,
 FOREIGN KEY(id_caja) REFERENCES caja(id_caja)
);

-- ── Datos iniciales ─────────────────────────────────────────

INSERT INTO rol (nombre)
SELECT 'ADMINISTRADOR' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'ADMINISTRADOR');

INSERT INTO rol (nombre)
SELECT 'VENDEDOR' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'VENDEDOR');

INSERT INTO rol (nombre)
SELECT 'TECNICO' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'TECNICO');

-- Password: admin123
INSERT INTO usuario (nombres, username, password, estado, id_rol)
SELECT
    'Administrador del Sistema',
    'admin',
    '$2b$10$fUIrgn8RtXctx0zvYo/nRumoEVlq9D.cyKEfGbuM5kZvuohTjviqq',
    TRUE,
    (SELECT id_rol FROM rol WHERE nombre = 'ADMINISTRADOR')
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'admin');

-- Password: vendedor123
INSERT INTO usuario (nombres, username, password, estado, id_rol)
SELECT
    'Vendedor de Prueba',
    'vendedor1',
    '$2b$10$kTCVA/z9YPTyDpNNr5p8Ye1Sruzh0AmVJkNbtRq0rTv8Lmz2D1WcW',
    TRUE,
    (SELECT id_rol FROM rol WHERE nombre = 'VENDEDOR')
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'vendedor1');

-- Password: tecnico123
INSERT INTO usuario (nombres, username, password, estado, id_rol)
SELECT
    'Tecnico de Prueba',
    'tecnico1',
    '$2b$10$ixoFF/wC1LcAes/kvSCnnOw7wsJc2lhO2uhnzyq9fDuLSEIxu52QG',
    TRUE,
    (SELECT id_rol FROM rol WHERE nombre = 'TECNICO')
WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'tecnico1');
