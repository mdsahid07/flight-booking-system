package edu.miu.cs.cs425.backend.data.repository;

import edu.miu.cs.cs425.backend.domain.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, String> {
    // Custom query methods
    List<Flight> findByOrigin_IataCodeAndDestination_IataCodeAndDepartureBetween(
            String originIataCode, String destinationIataCode, LocalDateTime startDateTime, LocalDateTime endDateTime);

    // New method with optional parameters
    @Query("SELECT f FROM Flight f WHERE " +
            "(:originIataCode IS NULL OR f.origin.iataCode = :originIataCode) AND " +
            "(:destinationIataCode IS NULL OR f.destination.iataCode = :destinationIataCode) AND " +
            "f.departure BETWEEN :startDateTime AND :endDateTime")
    List<Flight> findFlightsWithOptionalParams(
            @Param("originIataCode") String originIataCode,
            @Param("destinationIataCode") String destinationIataCode,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);


    List<Flight> findByAirline_Code(String airlineCode);
}