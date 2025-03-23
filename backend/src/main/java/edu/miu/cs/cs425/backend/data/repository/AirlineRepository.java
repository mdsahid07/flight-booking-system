package edu.miu.cs.cs425.backend.data.repository;

import edu.miu.cs.cs425.backend.domain.entity.Airline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AirlineRepository extends JpaRepository<Airline, String> {
    // Custom query method for finding by name (optional)
    List<Airline> findByNameContainingIgnoreCase(String name);
}