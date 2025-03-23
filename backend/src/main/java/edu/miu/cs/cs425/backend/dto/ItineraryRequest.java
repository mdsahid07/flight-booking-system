package edu.miu.cs.cs425.backend.dto;

import java.util.List;

public class ItineraryRequest {

    private List<FlightRequest> flights;
    private List<FlightRequest> returnFlights;

    // Constructors
    public ItineraryRequest() {}

    // Getters and setters
    public List<FlightRequest> getFlights() {
        return flights;
    }

    public void setFlights(List<FlightRequest> flights) {
        this.flights = flights;
    }

    public List<FlightRequest> getReturnFlights() {
        return returnFlights;
    }

    public void setReturnFlights(List<FlightRequest> returnFlights) {
        this.returnFlights = returnFlights;
    }
}