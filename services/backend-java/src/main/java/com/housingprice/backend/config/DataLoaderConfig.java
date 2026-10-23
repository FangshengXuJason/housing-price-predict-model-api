package com.housingprice.backend.config;

import com.housingprice.backend.model.HousingData;
import com.housingprice.backend.repository.HousingDataRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataLoaderConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataLoaderConfig.class);

    @Bean
    public CommandLineRunner loadData(HousingDataRepository housingDataRepository) {
        return args -> {
            long count = housingDataRepository.count();
            if (count > 0) {
                logger.info("Housing data table already contains {} records, skipping load", count);
                return;
            }

            logger.info("Housing data table is empty, loading CSV data...");
            loadCsvData(housingDataRepository);
        };
    }

    private void loadCsvData(HousingDataRepository repository) {
        List<HousingData> entities = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        new ClassPathResource("data/housing-data.csv").getInputStream(),
                        StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .build()
                     .parse(reader)) {

            for (CSVRecord record : parser) {
                HousingData entity = new HousingData();
                entity.setId(Integer.parseInt(record.get("id")));
                entity.setSquareFootage(Double.parseDouble(record.get("square_footage")));
                entity.setBedrooms(Integer.parseInt(record.get("bedrooms")));
                entity.setBathrooms(Double.parseDouble(record.get("bathrooms")));
                entity.setYearBuilt(Integer.parseInt(record.get("year_built")));
                entity.setLotSize(Double.parseDouble(record.get("lot_size")));
                entity.setDistanceToCityCenter(Double.parseDouble(record.get("distance_to_city_center")));
                entity.setSchoolRating(Double.parseDouble(record.get("school_rating")));
                entity.setPrice(Double.parseDouble(record.get("price")));
                entities.add(entity);
            }

            repository.saveAll(entities);
            logger.info("Successfully loaded {} housing data records", entities.size());

        } catch (Exception e) {
            logger.error("Failed to load housing data from CSV", e);
            throw new RuntimeException("Failed to load housing data", e);
        }
    }
}
