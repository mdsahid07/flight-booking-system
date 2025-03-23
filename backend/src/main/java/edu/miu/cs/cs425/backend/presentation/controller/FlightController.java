package edu.miu.cs.cs425.backend.presentation.controller;

import edu.miu.cs.cs425.backend.application.query.FlightRouteSearchQuery;
import edu.miu.cs.cs425.backend.domain.entity.FlightSearchResult;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import edu.miu.cs.cs425.backend.service.FlightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = {"http://localhost:3000","http://flight-app.s3-website-us-east-1.amazonaws.com"}, allowedHeaders = "*", allowCredentials = "true")
@Tag(name = "FlightRequest API", description = "Endpoints for managing flights")
public class FlightController {
    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @Operation(summary = "Create a new flight", description = "Creates a new flight with a unique ID")
    @ApiResponse(responseCode = "201", description = "FlightRequest created successfully")
    @PostMapping
    public ResponseEntity<Flight> createFlight(@RequestBody Flight flight) {
        Flight createdFlight = flightService.createFlight(flight);
        return ResponseEntity.status(201).body(createdFlight);
    }

    @Operation(summary = "Find flight by ID", description = "Retrieves details of a specific flight by its ID")
    @ApiResponse(responseCode = "200", description = "FlightRequest details retrieved successfully")
    @GetMapping("/{id}")
    public ResponseEntity<Flight> findFlightById(@PathVariable String id) {
        return flightService.findFlightById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Find all flights", description = "Retrieves a list of all flights")
    @ApiResponse(responseCode = "200", description = "List of flights retrieved successfully")
    @GetMapping
    public ResponseEntity<List<Flight>> findAllFlights() {
        List<Flight> flights = flightService.findAllFlights();
        return ResponseEntity.ok(flights);
    }

    @Operation(summary = "Update flight", description = "Updates the details of an existing flight")
    @ApiResponse(responseCode = "200", description = "FlightRequest updated successfully")
    @PutMapping("/{id}")
    public ResponseEntity<Flight> updateFlight(@PathVariable String id, @RequestBody Flight flightDetails) {
        try {
            Flight updatedFlight = flightService.updateFlight(id, flightDetails);
            return ResponseEntity.ok(updatedFlight);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Delete flight", description = "Deletes a flight by its ID")
    @ApiResponse(responseCode = "204", description = "FlightRequest deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable String id) {
        try {
            flightService.deleteFlight(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Search flights by route", description = "Searches for flight itineraries between two airports, including direct and connecting flights. Returns one-way itineraries if endDate is absent, or round-trip itineraries if endDate is provided, ordered by the filter criterion (fastest or cheapest).")
    @ApiResponse(responseCode = "200", description = "FlightRequest search result containing one-way or round-trip itineraries")
    @PostMapping("/search/route")
    public ResponseEntity<FlightSearchResult> findFlightsByRouteAndDate(
            @RequestBody(required = false) FlightRouteSearchQuery query) {
        try {
            FlightSearchResult result = flightService.findFlightsByRoute(query);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Search flights by airline", description = "Retrieves flights for a specific airline, optionally sorted by the specified filter criterion (e.g., fastest or cheapest)")
    @ApiResponse(responseCode = "200", description = "List of matching flights retrieved successfully")
    @GetMapping("/search/airline")
    public ResponseEntity<List<Flight>> findFlightsByAirline(
            @RequestParam String airlineCode,
            @RequestParam(required = false) String filterCriterion) {
        List<Flight> flights = flightService.findFlightsByAirline(airlineCode, filterCriterion);
        return ResponseEntity.ok(flights);
    }
}