package com.housingprice.backend.repository;

import com.housingprice.backend.model.PredictionRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.boot.CommandLineRunner;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PredictionRepositoryTest {

    @Autowired
    private PredictionRepository predictionRepository;

    // Disable DataLoaderConfig to prevent CSV loading in tests
    @MockitoBean(name = "loadData")
    private CommandLineRunner loadDataRunner;

    @BeforeEach
    void setUp() {
        predictionRepository.deleteAll();
    }

    @Test
    void saveAndFindById_success() {
        PredictionRecord record = new PredictionRecord(
                LocalDateTime.now(),
                2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 350000.0
        );

        PredictionRecord saved = predictionRepository.save(record);

        assertNotNull(saved.getId());
        assertEquals(2000.0, saved.getSquareFootage());
        assertEquals(3, saved.getBedrooms());
        assertEquals(350000.0, saved.getPredictedPrice());

        Optional<PredictionRecord> found = predictionRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals(saved.getId(), found.get().getId());
        assertEquals(350000.0, found.get().getPredictedPrice());
    }

    @Test
    void findById_notFound() {
        Optional<PredictionRecord> result = predictionRepository.findById(999L);
        assertFalse(result.isPresent());
    }

    @Test
    void findAllByOrderByTimestampDesc_withPagination() {
        PredictionRecord record1 = new PredictionRecord(
                LocalDateTime.now().minusHours(2),
                1500.0, 2, 1.0, 2000, 3000.0, 5.0, 7.0, 250000.0
        );
        PredictionRecord record2 = new PredictionRecord(
                LocalDateTime.now().minusHours(1),
                2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 350000.0
        );
        PredictionRecord record3 = new PredictionRecord(
                LocalDateTime.now(),
                2500.0, 4, 3.0, 2020, 8000.0, 15.0, 10.0, 600000.0
        );

        predictionRepository.save(record1);
        predictionRepository.save(record2);
        predictionRepository.save(record3);

        Page<PredictionRecord> page = predictionRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, 2));

        assertNotNull(page);
        assertEquals(2, page.getContent().size());
        assertEquals(3, page.getTotalElements());
        assertEquals(2, page.getTotalPages());

        List<PredictionRecord> content = page.getContent();
        assertTrue(content.get(0).getTimestamp().isAfter(content.get(1).getTimestamp()) ||
                   content.get(0).getTimestamp().isEqual(content.get(1).getTimestamp()));
    }

    @Test
    void findAllByOrderByTimestampDesc_emptyResult() {
        Page<PredictionRecord> page = predictionRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, 20));

        assertNotNull(page);
        assertEquals(0, page.getContent().size());
        assertEquals(0, page.getTotalElements());
    }

    @Test
    void deleteById_success() {
        PredictionRecord record = new PredictionRecord(
                LocalDateTime.now(),
                2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 350000.0
        );
        PredictionRecord saved = predictionRepository.save(record);
        Long id = saved.getId();

        assertTrue(predictionRepository.existsById(id));

        predictionRepository.deleteById(id);

        assertFalse(predictionRepository.existsById(id));
    }

    @Test
    void deleteById_nonExistent() {
        assertFalse(predictionRepository.existsById(999L));
        assertDoesNotThrow(() -> predictionRepository.deleteById(999L));
    }

    @Test
    void deleteAll_success() {
        predictionRepository.save(new PredictionRecord(
                LocalDateTime.now(), 1500.0, 2, 1.0, 2000, 3000.0, 5.0, 7.0, 250000.0));
        predictionRepository.save(new PredictionRecord(
                LocalDateTime.now(), 2000.0, 3, 2.0, 2010, 5000.0, 10.0, 8.0, 350000.0));

        assertTrue(predictionRepository.count() > 0);

        predictionRepository.deleteAll();

        assertEquals(0, predictionRepository.count());
    }

    @Test
    void save_multipleRecords() {
        for (int i = 0; i < 5; i++) {
            predictionRepository.save(new PredictionRecord(
                    LocalDateTime.now().plusSeconds(i),
                    1500.0 + i * 100, 2 + i, 1.0 + i * 0.5, 2000 + i, 3000.0 + i * 500,
                    5.0 + i, 7.0 + i * 0.5, 250000.0 + i * 50000
            ));
        }

        assertEquals(5, predictionRepository.count());

        Page<PredictionRecord> page = predictionRepository.findAllByOrderByTimestampDesc(PageRequest.of(0, 10));
        assertEquals(5, page.getContent().size());
    }
}
