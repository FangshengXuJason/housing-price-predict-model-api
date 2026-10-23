package com.housingprice.backend.repository;

import com.housingprice.backend.model.HousingData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HousingDataRepository extends JpaRepository<HousingData, Integer> {

    long count();
}
