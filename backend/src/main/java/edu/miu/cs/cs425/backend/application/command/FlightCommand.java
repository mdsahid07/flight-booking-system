package edu.miu.cs.cs425.backend.application.command;

public class FlightCommand {

    private String id;

    // Constructors
    public FlightCommand() {}

    public FlightCommand(String id) {
        this.id = id;
    }

    // Getter
    public String getId() {
        return id;
    }
}