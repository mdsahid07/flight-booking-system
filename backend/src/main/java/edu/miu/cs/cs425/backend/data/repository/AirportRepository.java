package edu.miu.cs.cs425.backend.data.repository;

import edu.miu.cs.cs425.backend.domain.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AirportRepository extends JpaRepository<Airport, String> {
    // Custom query method for finding by city or country
    List<Airport> findByCityContainingIgnoreCase(String city);
    List<Airport> findByCountryContainingIgnoreCase(String country);
}
