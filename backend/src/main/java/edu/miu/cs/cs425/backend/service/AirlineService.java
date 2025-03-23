package edu.miu.cs.cs425.backend.service;

import edu.miu.cs.cs425.backend.data.repository.AirlineRepository;
import edu.miu.cs.cs425.backend.domain.entity.Airline;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AirlineService {
    private final AirlineRepository airlineRepository;

    public AirlineService(AirlineRepository airlineRepository) {
        this.airlineRepository = airlineRepository;
    }

    // Create
    public Airline createAirline(Airline airline) {
        if (airline.getCode() == null || airline.getCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Airline code cannot be null or empty");
        }
        return airlineRepository.save(airline);
    }

    // Read - Find One
    public Optional<Airline> findAirlineById(String code) {
        return airlineRepository.findById(code);
    }

    // Read - Find All
    public List<Airline> findAllAirlines() {
        return airlineRepository.findAll();
    }

    // Update
    public Airline updateAirline(String code, Airline airlineDetails) {
        Optional<Airline> existingAirline = airlineRepository.findById(code);
        if (existingAirline.isPresent()) {
            Airline airline = existingAirline.get();
            airline.setName(airlineDetails.getName());
            airline.setLogoUrl(airlineDetails.getLogoUrl());
            return airlineRepository.save(airline);
        } else {
            throw new IllegalArgumentException("Airline with code " + code + " not found");
        }
    }

    // Delete
    public void deleteAirline(String code) {
        if (!airlineRepository.existsById(code)) {
            throw new IllegalArgumentException("Airline with code " + code + " not found");
        }
        airlineRepository.deleteById(code);
    }

    // Custom search by name
    public List<Airline> findAirlinesByName(String name) {
        return airlineRepository.findByNameContainingIgnoreCase(name);
    }
}