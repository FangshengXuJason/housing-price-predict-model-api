package com.housingprice.backend.dto.response;

public class HealthResponse {

    private String status;
    private String mlApiStatus;

    public HealthResponse() {
    }

    public HealthResponse(String status, String mlApiStatus) {
        this.status = status;
        this.mlApiStatus = mlApiStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMlApiStatus() {
        return mlApiStatus;
    }

    public void setMlApiStatus(String mlApiStatus) {
        this.mlApiStatus = mlApiStatus;
    }

    @Override
    public String toString() {
        return "HealthResponse{" +
                "status='" + status + '\'' +
                ", mlApiStatus='" + mlApiStatus + '\'' +
                '}';
    }
}
