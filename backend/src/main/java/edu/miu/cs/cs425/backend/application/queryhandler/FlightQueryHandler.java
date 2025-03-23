package edu.miu.cs.cs425.backend.application.queryhandler;

import edu.miu.cs.cs425.backend.application.query.GetFlightQuery;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FlightQueryHandler {
    private final FlightRepository flightRepository;

    public FlightQueryHandler(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public Optional<Flight> handle(GetFlightQuery query) {
        return flightRepository.findById(query.getFlightId());
    }
}