package com.epiis.savat;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class SavatApplication {

	public static void main(String[] args) {
		SpringApplication.run(SavatApplication.class, args);
	}

	@Bean
	public CommandLineRunner dataSeeder(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				System.out.println("⏳ Insertando roles y usuarios iniciales en PostgreSQL...");

				// 1. Crear los roles por defecto si no existen
				jdbcTemplate.execute("INSERT INTO rol (nombre) SELECT 'ADMINISTRADOR' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'ADMINISTRADOR')");
				jdbcTemplate.execute("INSERT INTO rol (nombre) SELECT 'VENDEDOR' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'VENDEDOR')");
				jdbcTemplate.execute("INSERT INTO rol (nombre) SELECT 'TECNICO' WHERE NOT EXISTS (SELECT 1 FROM rol WHERE nombre = 'TECNICO')");

				// 2. Insertar el Administrador por defecto usando el query exacto de tu script bd_hosting.sql
				String insertAdminSql = "INSERT INTO usuario (nombres, username, password, estado, id_rol) " +
						"SELECT 'Administrador del Sistema', 'admin', '$2b$10$fUIrgn8RtXctx0zvYo/nRumoEVlq9D.cyKEfGbuM5kZvuohTjviqq', TRUE, " +
						"(SELECT id_rol FROM rol WHERE nombre = 'ADMINISTRADOR') " +
						"WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'admin')";
				jdbcTemplate.execute(insertAdminSql);

				// 3. Insertar el Vendedor por defecto
				String insertVendedorSql = "INSERT INTO usuario (nombres, username, password, estado, id_rol) " +
						"SELECT 'Vendedor de Prueba', 'vendedor1', '$2b$10$kTCVA/z9YPTyDpNNr5p8Ye1Sruzh0AmVJkNbtRq0rTv8Lmz2D1WcW', TRUE, " +
						"(SELECT id_rol FROM rol WHERE nombre = 'VENDEDOR') " +
						"WHERE NOT EXISTS (SELECT 1 FROM usuario WHERE username = 'vendedor1')";
				jdbcTemplate.execute(insertVendedorSql);

				System.out.println("================");
				System.out.println("🎉 ¡SAV-AT SEEDER: Usuarios y Roles listos en PostgreSQL de Render!");
				System.out.println("================");

			} catch (Exception e) {
				System.out.println("⚠️ Nota del Seeder: " + e.getMessage() + " (Es posible que las tablas aún se estén creando)");
			}
		};
	}
}
