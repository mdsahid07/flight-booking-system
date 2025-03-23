package edu.miu.cs.cs425.backend.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Flight {
    @Id
    private String id;
    private String flightNumber;
    @ManyToOne
    private Airline airline;
    @ManyToOne
    private Airport origin;
    @ManyToOne
    private Airport destination;
    private LocalDateTime departure;
    private LocalDateTime arrival;
    private int duration;
    private double price;
    private int seatsAvailable;

    // No-args constructor
    public Flight() {
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFlightNumber() {
        return flightNumber;
    }

    public void setFlightNumber(String flightNumber) {
        this.flightNumber = flightNumber;
    }

    public Airline getAirline() {
        return airline;
    }

    public void setAirline(Airline airline) {
        this.airline = airline;
    }

    public Airport getOrigin() {
        return origin;
    }

    public void setOrigin(Airport origin) {
        this.origin = origin;
    }

    public Airport getDestination() {
        return destination;
    }

    public void setDestination(Airport destination) {
        this.destination = destination;
    }

    public LocalDateTime getDeparture() {
        return departure;
    }

    public void setDeparture(LocalDateTime departure) {
        this.departure = departure;
    }

    public LocalDateTime getArrival() {
        return arrival;
    }

    public void setArrival(LocalDateTime arrival) {
        this.arrival = arrival;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getSeatsAvailable() {
        return seatsAvailable;
    }

    public void setSeatsAvailable(int seatsAvailable) {
        this.seatsAvailable = seatsAvailable;
    }

    @Override
    public String toString() {
        return "FlightRequest{" +
                "id='" + id + '\'' +
                ", flightNumber='" + flightNumber + '\'' +
                ", airline=" + airline +
                ", origin=" + origin +
                ", destination=" + destination +
                ", departure=" + departure +
                ", arrival=" + arrival +
                ", duration=" + duration +
                ", price=" + price +
                ", seatsAvailable=" + seatsAvailable +
                '}';
    }
}