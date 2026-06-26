package com.epiis.savat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    // Al habilitar @EnableTransactionManagement, Spring se encarga automáticamente
    // de gestionar los rollbacks si ocurre un error inesperado durante operaciones complejas 
    // (como registrar una venta y descontar stock simultáneamente).
}