package edu.miu.cs.cs425.backend.presentation.controller;

import edu.miu.cs.cs425.backend.domain.entity.Airport;
import edu.miu.cs.cs425.backend.service.AirportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/airports")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:1"}, allowedHeaders = "*", allowCredentials = "true")
@Tag(name = "Airport API", description = "Endpoints for managing airports")
public class AirportController {
    private final AirportService airportService;

    public AirportController(AirportService airportService) {
        this.airportService = airportService;
    }

    @Operation(summary = "Create a new airport", description = "Creates a new airport with a unique IATA code")
    @ApiResponse(responseCode = "201", description = "Airport created successfully")
    @PostMapping
    public ResponseEntity<Airport> createAirport(@RequestBody Airport airport) {
        Airport createdAirport = airportService.createAirport(airport);
        return ResponseEntity.status(201).body(createdAirport);
    }

    @Operation(summary = "Find airport by IATA code", description = "Retrieves details of a specific airport by its IATA code")
    @ApiResponse(responseCode = "200", description = "Airport details retrieved successfully")
    @GetMapping("/{iataCode}")
    public ResponseEntity<Airport> findAirportById(@PathVariable String iataCode) {
        return airportService.findAirportById(iataCode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Find all airports", description = "Retrieves a list of all airports")
    @ApiResponse(responseCode = "200", description = "List of airports retrieved successfully")
    @GetMapping
    public ResponseEntity<List<Airport>> findAllAirports() {
        List<Airport> airports = airportService.findAllAirports();
        return ResponseEntity.ok(airports);
    }

    @Operation(summary = "Update airport", description = "Updates the details of an existing airport")
    @ApiResponse(responseCode = "200", description = "Airport updated successfully")
    @PutMapping("/{iataCode}")
    public ResponseEntity<Airport> updateAirport(@PathVariable String iataCode, @RequestBody Airport airportDetails) {
        try {
            Airport updatedAirport = airportService.updateAirport(iataCode, airportDetails);
            return ResponseEntity.ok(updatedAirport);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Delete airport", description = "Deletes an airport by its IATA code")
    @ApiResponse(responseCode = "204", description = "Airport deleted successfully")
    @DeleteMapping("/{iataCode}")
    public ResponseEntity<Void> deleteAirport(@PathVariable String iataCode) {
        try {
            airportService.deleteAirport(iataCode);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Search airports by city", description = "Retrieves airports with cities matching the given pattern")
    @ApiResponse(responseCode = "200", description = "List of matching airports retrieved successfully")
    @GetMapping("/search/city")
    public ResponseEntity<List<Airport>> findAirportsByCity(@RequestParam String city) {
        List<Airport> airports = airportService.findAirportsByCity(city);
        return ResponseEntity.ok(airports);
    }

    @Operation(summary = "Search airports by country", description = "Retrieves airports with countries matching the given pattern")
    @ApiResponse(responseCode = "200", description = "List of matching airports retrieved successfully")
    @GetMapping("/search/country")
    public ResponseEntity<List<Airport>> findAirportsByCountry(@RequestParam String country) {
        List<Airport> airports = airportService.findAirportsByCountry(country);
        return ResponseEntity.ok(airports);
    }
}