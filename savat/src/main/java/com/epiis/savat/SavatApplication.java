package com.epiis.savat;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class SavatApplication {

	public static void main(String[] args) {
		SpringApplication.run(SavatApplication.class, args);
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins("https://savat-frontend.onrender.com", "http://localhost:4200")
						.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
						.allowedHeaders("*")
						.allowCredentials(true);
			}
		};
	}

	@Bean
	public CommandLineRunner dataSeederNuevo(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				System.out.println("⏳ Insertando datos iniciales del sistema en PostgreSQL...");

				// 1. ROLES
				jdbcTemplate.execute("INSERT INTO rol (nombre) SELECT 'ADMINISTRADOR' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'ADMINISTRADOR')");
				jdbcTemplate.execute("INSERT INTO rol (nombre) SELECT 'VENDEDOR' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'VENDEDOR')");
				jdbcTemplate.execute("INSERT INTO rol (nombre) SELECT 'TECNICO' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'TECNICO')");

				// 2. USUARIOS
				jdbcTemplate.execute("INSERT INTO usuario (nombres, username, password, estado, id_rol) " +
						"SELECT 'Administrador del Sistema', 'admin', '$2b$10$fUIrgn8RtXctx0zvYo/nRumoEVlq9D.cyKEfGbuM5kZvuohTjviqq', TRUE, " +
						"(SELECT id_rol FROM rol WHERE nombre = 'ADMINISTRADOR') " +
						"WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'admin')");

				jdbcTemplate.execute("INSERT INTO usuario (nombres, username, password, estado, id_rol) " +
						"SELECT 'Vendedor de Prueba', 'vendedor1', '$2b$10$kTCVA/z9YPTyDpNNr5p8Ye1Sruzh0AmVJkNbtRq0rTv8Lmz2D1WcW', TRUE, " +
						"(SELECT id_rol FROM rol WHERE nombre = 'VENDEDOR') " +
						"WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'vendedor1')");

				jdbcTemplate.execute("INSERT INTO usuario (nombres, username, password, estado, id_rol) " +
						"SELECT 'Tecnico de Prueba', 'tecnico1', '$2b$10$ixoFF/wC1LcAes/kvSCnnOw7wsJc2lhO2uhnzyq9fDuLSEIxu52QG', TRUE, " +
						"(SELECT id_rol FROM rol WHERE nombre = 'TECNICO') " +
						"WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'tecnico1')");

				// 3. CATEGORÍAS DE PRODUCTO
				jdbcTemplate.execute("INSERT INTO categoria_producto (nombre) SELECT 'Laptops y Computadoras' WHERE NOT EXISTS (SELECT 1 FROM categoria_producto WHERE nombre = 'Laptops y Computadoras')");
				jdbcTemplate.execute("INSERT INTO categoria_producto (nombre) SELECT 'Componentes y Repuestos' WHERE NOT EXISTS (SELECT 1 FROM categoria_producto WHERE nombre = 'Componentes y Repuestos')");

				// 4. PROVEEDORES
				jdbcTemplate.execute("INSERT INTO proveedor (nombre, ruc, telefono, correo, direccion) " +
						"SELECT 'Importaciones Tecnológicas SAC', '20123456789', '987654321', 'contacto@importec.com', 'Av. Las Flores 456' " +
						"WHERE NOT EXISTS (SELECT 1 FROM proveedor WHERE ruc = '20123456789')");

				// 5. PRODUCTOS DE PRUEBA (Venta y Repuestos)
				jdbcTemplate.execute("INSERT INTO producto (nombre, descripcion, precio_venta, costo, stock, stock_minimo, codigo_barras, tipo_producto, estado, id_categoria_producto, id_proveedor) " +
						"SELECT 'Laptop ASUS Vivobook 15', 'Intel i5, 16GB RAM, 512GB SSD', 2499.00, 1950.00, 10, 2, '7501234567890', 'VENTA', TRUE, " +
						"(SELECT id_categoria_producto FROM categoria_producto WHERE nombre = 'Laptops y Computadoras'), " +
						"(SELECT id_proveedor FROM proveedor WHERE ruc = '20123456789') " +
						"WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo_barras = '7501234567890')");

				jdbcTemplate.execute("INSERT INTO producto (nombre, descripcion, precio_venta, costo, stock, stock_minimo, codigo_barras, tipo_producto, estado, id_categoria_producto, id_proveedor) " +
						"SELECT 'Memoria RAM DDR4 8GB Kingston', 'Frecuencia 3200MHz para Laptop', 120.00, 85.00, 25, 5, '7509876543210', 'REPUESTO', TRUE, " +
						"(SELECT id_categoria_producto FROM categoria_producto WHERE nombre = 'Componentes y Repuestos'), " +
						"(SELECT id_proveedor FROM proveedor WHERE ruc = '20123456789') " +
						"WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo_barras = '7509876543210')");

				jdbcTemplate.execute("INSERT INTO producto (nombre, descripcion, precio_venta, costo, stock, stock_minimo, codigo_barras, tipo_producto, estado, id_categoria_producto, id_proveedor) " +
						"SELECT 'Disco Duro Sólido SSD 1TB Crucial', 'Formato M.2 NVMe PCIe', 280.00, 210.00, 15, 3, '7504567890123', 'REPUESTO', TRUE, " +
						"(SELECT id_categoria_producto FROM categoria_producto WHERE nombre = 'Componentes y Repuestos'), " +
						"(SELECT id_proveedor FROM proveedor WHERE ruc = '20123456789') " +
						"WHERE NOT EXISTS (SELECT 1 FROM producto WHERE codigo_barras = '7504567890123')");

				// 6. CATEGORÍAS DE CLIENTE
				jdbcTemplate.execute("INSERT INTO categoria_cliente (nombre) SELECT 'Cliente Regular' WHERE NOT EXISTS (SELECT 1 FROM categoria_cliente WHERE nombre = 'Cliente Regular')");
				jdbcTemplate.execute("INSERT INTO categoria_cliente (nombre) SELECT 'Cliente VIP' WHERE NOT EXISTS (SELECT 1 FROM categoria_cliente WHERE nombre = 'Cliente VIP')");

				// 7. CLIENTES DE PRUEBA
				jdbcTemplate.execute("INSERT INTO cliente (nombres, dni_ruc, telefono, correo, direccion, id_categoria_cliente) " +
						"SELECT 'Juan Pérez Gómez', '45678912', '912345678', 'juan.perez@gmail.com', 'Jr. Puno 123', " +
						"(SELECT id_categoria_cliente FROM categoria_cliente WHERE nombre = 'Cliente Regular') " +
						"WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE dni_ruc = '45678912')");

				jdbcTemplate.execute("INSERT INTO cliente (nombres, dni_ruc, telefono, correo, direccion, id_categoria_cliente) " +
						"SELECT 'Corporación Alfa S.A.C.', '20987654321', '945612378', 'informes@corp-alfa.com', 'Av. Larco 789', " +
						"(SELECT id_categoria_cliente FROM categoria_cliente WHERE nombre = 'Cliente VIP') " +
						"WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE dni_ruc = '20987654321')");

				System.out.println("=========================================================================");
				System.out.println("🎉 ¡SAV-AT SEEDER COMPLETO: Usuarios, Productos y Clientes listos en la BD!");
				System.out.println("=========================================================================");

			} catch (Exception e) {
				System.out.println("⚠️ Nota del Seeder: " + e.getMessage());
			}
		};
	}
}
