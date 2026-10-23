package com.housingprice.backend.service;

import com.housingprice.backend.dto.request.HousingFeaturesDTO;
import com.housingprice.backend.dto.response.ModelInfoResponse;

import java.util.List;

public interface MLApiClientInterface {

    double predict(HousingFeaturesDTO features);

    List<Double> predictBatch(List<HousingFeaturesDTO> features);

    ModelInfoResponse getModelInfo();
}
