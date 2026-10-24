package com.housingprice.backend.controller;

import com.housingprice.backend.model.HousingData;
import com.housingprice.backend.repository.HousingDataRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final HousingDataRepository housingDataRepository;

    public DashboardController(HousingDataRepository housingDataRepository) {
        this.housingDataRepository = housingDataRepository;
    }

    @GetMapping("/data")
    @Transactional(readOnly = true)
    public ResponseEntity<List<HousingData>> getDashboardData() {
        return ResponseEntity.ok(housingDataRepository.findAll());
    }
}
