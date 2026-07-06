package com.epiis.savat.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.whatsapp-from}")
    private String whatsappFrom; // "whatsapp:+14155238886"

    /**
     * Envía un mensaje de WhatsApp al número del cliente.
     *
     * @param telefonoCliente número del cliente (Ej: "987654321" o "+51987654321")
     * @param mensaje         texto a enviar
     */
    public void enviarMensaje(String telefonoCliente, String mensaje) {
        if (telefonoCliente == null || telefonoCliente.isBlank()) {
            log.warn("WhatsApp: cliente sin teléfono registrado, omitiendo envío.");
            return;
        }

        try {
            Twilio.init(accountSid, authToken);

            // Normaliza el número: si no tiene +51 lo agrega (Perú)
            String destino = normalizarNumero(telefonoCliente);

            log.info("WhatsApp: intentando enviar a {} desde {}", destino, whatsappFrom);

            Message msg = Message.creator(
                    new PhoneNumber("whatsapp:" + destino),
                    new PhoneNumber(whatsappFrom),
                    mensaje
            ).create();

            log.info("WhatsApp enviado a {} | SID: {} | Status: {}", destino, msg.getSid(), msg.getStatus());

        } catch (com.twilio.exception.ApiException e) {
            // Errores comunes:
            // 63016 → El destinatario no se unió al Sandbox. El cliente debe enviar
            //         el código de unión (ej. "join <palabra>") al número de Twilio Sandbox.
            // 21608 → Número no habilitado para WhatsApp.
            log.error("WhatsApp error API Twilio [código {}]: {} — destinatario: {}",
                    e.getCode(), e.getMessage(), telefonoCliente);
        } catch (Exception e) {
            // No queremos que un error de WhatsApp rompa el flujo principal
            log.error("Error al enviar WhatsApp a {}: {}", telefonoCliente, e.getMessage());
        }
    }

    /**
     * Agrega el prefijo +51 (Perú) si el número no tiene código de país.
     */
    private String normalizarNumero(String telefono) {
        String limpio = telefono.replaceAll("[^\\d+]", "");
        if (limpio.startsWith("+")) return limpio;
        if (limpio.startsWith("51") && limpio.length() >= 11) return "+" + limpio;
        return "+51" + limpio;
    }
}
