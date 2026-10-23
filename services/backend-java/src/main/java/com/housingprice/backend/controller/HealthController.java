package com.housingprice.backend.controller;

import com.housingprice.backend.dto.response.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
public class HealthController {

    private final RestTemplate restTemplate;
    private final String mlApiUrl;

    public HealthController(RestTemplate restTemplate,
                            @Value("${ml.api.url}") String mlApiUrl) {
        this.restTemplate = restTemplate;
        this.mlApiUrl = mlApiUrl;
    }

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = new HealthResponse();
        response.setStatus("ok");

        try {
            restTemplate.getForObject(mlApiUrl + "/health", Map.class);
            response.setMlApiStatus("ok");
        } catch (Exception e) {
            response.setMlApiStatus("unavailable");
            response.setStatus("degraded");
        }

        return ResponseEntity.ok(response);
    }
}
