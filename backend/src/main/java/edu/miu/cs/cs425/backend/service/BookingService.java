package edu.miu.cs.cs425.backend.service;

import edu.miu.cs.cs425.backend.application.command.CreateBookingCommand;
import edu.miu.cs.cs425.backend.application.commandhandler.BookingCommandHandler;
import edu.miu.cs.cs425.backend.application.query.FlightSearchQuery;
import edu.miu.cs.cs425.backend.application.query.GetFlightQuery;
import edu.miu.cs.cs425.backend.application.queryhandler.FlightQueryHandler;
import edu.miu.cs.cs425.backend.application.queryhandler.FlightSearchQueryHandler;
import edu.miu.cs.cs425.backend.domain.entity.Booking;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import edu.miu.cs.cs425.backend.domain.entity.FlightSearchResult;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BookingService {
    private final BookingCommandHandler bookingCommandHandler;
    private final FlightQueryHandler flightQueryHandler;
    private final FlightSearchQueryHandler flightSearchQueryHandler;

    public BookingService(
            BookingCommandHandler bookingCommandHandler,
            FlightQueryHandler flightQueryHandler,
            FlightSearchQueryHandler flightSearchQueryHandler) {
        this.bookingCommandHandler = bookingCommandHandler;
        this.flightQueryHandler = flightQueryHandler;
        this.flightSearchQueryHandler = flightSearchQueryHandler;
    }

    public Booking createBooking(CreateBookingCommand command) {
        return bookingCommandHandler.handle(command);
    }

    public Optional<Flight> getFlight(String flightId) {
        GetFlightQuery query = new GetFlightQuery();
        query.setFlightId(flightId);
        return flightQueryHandler.handle(query);
    }

    public FlightSearchResult searchFlights(FlightSearchQuery query) {
        return flightSearchQueryHandler.handle(query);
    }

    // New method to get a booking by ID
    public Booking getBookingById(Long id) {
        return bookingCommandHandler.getBookingById(id);
    }

    // New method to save a booking
    public Booking save(Booking booking) {
        return bookingCommandHandler.save(booking);
    }
}