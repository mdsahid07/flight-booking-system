package edu.miu.cs.cs425.backend.domain.entity;

import java.util.List;

public class FlightSearchResult {

    private List<Itinerary> oneWayItineraries; // For one-way trips
    private List<RoundTripItinerary> roundTripItineraries; // For round trips, using standalone class

    // Constructors
    public FlightSearchResult() {
    }

    public FlightSearchResult(List<Itinerary> oneWayItineraries, List<RoundTripItinerary> roundTripItineraries) {
        this.oneWayItineraries = oneWayItineraries;
        this.roundTripItineraries = roundTripItineraries;
    }

    // Getters and setters
    public List<Itinerary> getOneWayItineraries() {
        return oneWayItineraries;
    }

    public void setOneWayItineraries(List<Itinerary> oneWayItineraries) {
        this.oneWayItineraries = oneWayItineraries;
    }

    public List<RoundTripItinerary> getRoundTripItineraries() {
        return roundTripItineraries;
    }

    public void setRoundTripItineraries(List<RoundTripItinerary> roundTripItineraries) {
        this.roundTripItineraries = roundTripItineraries;
    }

    @Override
    public String toString() {
        return "FlightSearchResult{" +
                "oneWayItineraries=" + oneWayItineraries +
                ", roundTripItineraries=" + roundTripItineraries +
                '}';
    }
}