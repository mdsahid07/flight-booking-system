package edu.miu.cs.cs425.backend.application.query;


import lombok.Data;

@Data
public class GetFlightQuery {
    private String flightId;

    //public String getFlight(flightId)

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }



}
