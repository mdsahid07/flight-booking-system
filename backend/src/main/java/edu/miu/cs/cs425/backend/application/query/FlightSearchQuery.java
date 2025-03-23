package edu.miu.cs.cs425.backend.application.query;

import java.time.LocalDate;

public class FlightSearchQuery {
    private String startAirport; // IATA code of the starting airport
    private String destinationAirport; // IATA code of the destination airport
    private LocalDate startDate; // Departure date
    private LocalDate returnDate; // Optional return date for round trips
    private String filter; // Filter type: "fastest", "cheapest", or null for default

    // No-args constructor
    public FlightSearchQuery() {
    }

    // Getters and setters
    public String getStartAirport() {
        return startAirport;
    }

    public void setStartAirport(String startAirport) {
        this.startAirport = startAirport;
    }

    public String getDestinationAirport() {
        return destinationAirport;
    }

    public void setDestinationAirport(String destinationAirport) {
        this.destinationAirport = destinationAirport;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public String getFilter() {
        return filter;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    @Override
    public String toString() {
        return "FlightSearchQuery{" +
                "startAirport='" + startAirport + '\'' +
                ", destinationAirport='" + destinationAirport + '\'' +
                ", startDate=" + startDate +
                ", returnDate=" + returnDate +
                ", filter='" + filter + '\'' +
                '}';
    }
}
