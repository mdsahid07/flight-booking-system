package edu.miu.cs.cs425.backend.service;

import edu.miu.cs.cs425.backend.data.repository.AirportRepository;
import edu.miu.cs.cs425.backend.domain.entity.Airport;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class AirportService {
    private final AirportRepository airportRepository;

    public AirportService(AirportRepository airportRepository) {
        this.airportRepository = airportRepository;
    }

    // Create
    public Airport createAirport(Airport airport) {
        if (airport.getIataCode() == null || airport.getIataCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Airport IATA code cannot be null or empty");
        }
        return airportRepository.save(airport);
    }

    // Read - Find One
    public Optional<Airport> findAirportById(String iataCode) {
        return airportRepository.findById(iataCode);
    }

    // Read - Find All
    public List<Airport> findAllAirports() {
        return airportRepository.findAll();
    }

    // Update
    public Airport updateAirport(String iataCode, Airport airportDetails) {
        Optional<Airport> existingAirport = airportRepository.findById(iataCode);
        if (existingAirport.isPresent()) {
            Airport airport = existingAirport.get();
            airport.setName(airportDetails.getName());
            airport.setCity(airportDetails.getCity());
            airport.setCountry(airportDetails.getCountry());
            return airportRepository.save(airport);
        } else {
            throw new IllegalArgumentException("Airport with IATA code " + iataCode + " not found");
        }
    }

    // Delete
    public void deleteAirport(String iataCode) {
        if (!airportRepository.existsById(iataCode)) {
            throw new IllegalArgumentException("Airport with IATA code " + iataCode + " not found");
        }
        airportRepository.deleteById(iataCode);
    }

    // Custom search by city
    public List<Airport> findAirportsByCity(String city) {
        return airportRepository.findByCityContainingIgnoreCase(city);
    }

    // Custom search by country
    public List<Airport> findAirportsByCountry(String country) {
        return airportRepository.findByCountryContainingIgnoreCase(country);
    }
}
