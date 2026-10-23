package com.housingprice.backend.repository;

import com.housingprice.backend.model.PredictionRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionRepository extends JpaRepository<PredictionRecord, Long> {

    Page<PredictionRecord> findAllByOrderByTimestampDesc(Pageable pageable);

    void deleteAll();
}
