package edu.miu.cs.cs425.backend.domain.entity;

import java.util.List;

public class RoundTripItinerary {
    private List<Flight> outboundFlights;
    private List<Flight> returnFlights;
    private Double totalPrice;
    private Integer totalDuration;

    // Constructors
    public RoundTripItinerary() {
    }

    // Getters and setters
    public List<Flight> getOutboundFlights() {
        return outboundFlights;
    }

    public void setOutboundFlights(List<Flight> outboundFlights) {
        this.outboundFlights = outboundFlights;
    }

    public List<Flight> getReturnFlights() {
        return returnFlights;
    }

    public void setReturnFlights(List<Flight> returnFlights) {
        this.returnFlights = returnFlights;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Integer getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(Integer totalDuration) {
        this.totalDuration = totalDuration;
    }

    // New method to calculate totals
    public void calculateTotals() {
        double outboundPrice = outboundFlights != null ? outboundFlights.stream().mapToDouble(Flight::getPrice).sum() : 0.0;
        double returnPrice = returnFlights != null ? returnFlights.stream().mapToDouble(Flight::getPrice).sum() : 0.0;
        int outboundDuration = outboundFlights != null ? outboundFlights.stream().mapToInt(Flight::getDuration).sum() : 0;
        int returnDuration = returnFlights != null ? returnFlights.stream().mapToInt(Flight::getDuration).sum() : 0;

        this.totalPrice = outboundPrice + returnPrice;
        this.totalDuration = outboundDuration + returnDuration;
    }
}