package edu.miu.cs.cs425.backend.domain.entity;

import java.util.List;

public class Itinerary {
    private List<Flight> flights;
    private Double totalPrice;
    private Integer totalDuration;

    // Constructors
    public Itinerary() {}

    public Itinerary(List<Flight> flights, Double totalPrice, Integer totalDuration) {
        this.flights = flights;
        this.totalPrice = totalPrice;
        this.totalDuration = totalDuration;
    }

    // Getters and setters
    public List<Flight> getFlights() {
        return flights;
    }

    public void setFlights(List<Flight> flights) {
        this.flights = flights;
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

    // Updated method to calculate totals with a discount based on number of legs
    public void calculateTotals() {
        if (flights == null || flights.isEmpty()) {
            this.totalPrice = 0.0;
            this.totalDuration = 0;
            return;
        }

        // Calculate base total price (sum of individual flight prices)
        double baseTotalPrice = flights.stream()
                .mapToDouble(Flight::getPrice)
                .sum();

        // Calculate total duration
        this.totalDuration = flights.stream()
                .mapToInt(Flight::getDuration)
                .sum();

        // Apply discount based on number of legs
        int numberOfLegs = flights.size();
        double discountFactor = calculateDiscountFactor(numberOfLegs);
        this.totalPrice = baseTotalPrice * discountFactor;
    }

    // Helper method to calculate discount factor based on number of legs
    private double calculateDiscountFactor(int numberOfLegs) {
        // Example discount logic: 5% discount per additional leg beyond 1
        // 1 leg: 100% (no discount), 2 legs: 95%, 3 legs: 90%, etc.
        if (numberOfLegs <= 1) {
            return 1.0; // No discount for single-leg itinerary
        }
        double discountPerLeg = 0.5; // 5% discount per additional leg
        double totalDiscount = discountPerLeg * (numberOfLegs - 1);
        return Math.max(0.5, 1.0 - totalDiscount); // Cap discount at 50% (minimum 50% of original price)
    }
}