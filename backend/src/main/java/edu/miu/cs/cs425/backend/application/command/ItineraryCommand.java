package edu.miu.cs.cs425.backend.application.command;

import java.util.List;

public class ItineraryCommand {

    private List<FlightCommand> flights;
    private List<FlightCommand> returnFlights;

    // Constructors
    public ItineraryCommand() {}

    public ItineraryCommand(List<FlightCommand> flights, List<FlightCommand> returnFlights) {
        this.flights = flights;
        this.returnFlights = returnFlights;
    }

    // Getters
    public List<FlightCommand> getFlights() {
        return flights;
    }

    public List<FlightCommand> getReturnFlights() {
        return returnFlights;
    }
}
