package com.geradorexcedente.monitoring;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    /*
     * Ele serve apenas para:
     * ping
     * 
     * uptime
     * 
     * monitoramento do servidor
     */

    @GetMapping("/health")
    public String health() {
        return "API ONLINE";
    }
}
