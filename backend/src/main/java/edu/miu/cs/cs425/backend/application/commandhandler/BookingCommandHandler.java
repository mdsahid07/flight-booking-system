package edu.miu.cs.cs425.backend.application.commandhandler;

import edu.miu.cs.cs425.backend.application.command.CreateBookingCommand;
import edu.miu.cs.cs425.backend.data.repository.BookingRepository;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.domain.entity.Booking;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import edu.miu.cs.cs425.backend.domain.entity.FlightLeg;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookingCommandHandler {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;

    public BookingCommandHandler(BookingRepository bookingRepository, FlightRepository flightRepository) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
    }

    @Transactional
    public Booking handle(CreateBookingCommand command) {
        // Create Booking entity
        Booking booking = new Booking();
        booking.setUserId(command.getUserId());
        booking.setTotalPrice(command.getTotalPrice());
        booking.setFareType(command.getFareType());
        booking.setUserDetails(command.getUserDetails());
        booking.setSelectedSeat(command.getSelectedSeat());
        booking.setStatus(command.getStatus());
        // Parse ISO 8601 date with UTC and convert to LocalDateTime
        Instant instant = Instant.parse(command.getBookingDate());
        booking.setCreatedAt(LocalDateTime.ofInstant(instant, ZoneId.systemDefault()));

        // Map outbound flight legs
        List<FlightLeg> flightLegs = new ArrayList<>();
        for (int i = 0; i < command.getItinerary().getFlights().size(); i++) {
            String flightId = command.getItinerary().getFlights().get(i).getId();
            Flight flight = flightRepository.findById(flightId)
                    .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + flightId));
            FlightLeg leg = new FlightLeg();
            leg.setFlight(flight);
            leg.setLegNumber(i + 1);
            flightLegs.add(leg);
        }
        booking.setFlightLegs(flightLegs);

        // Map return flight legs (if present)
        if (command.getItinerary().getReturnFlights() != null && !command.getItinerary().getReturnFlights().isEmpty()) {
            List<FlightLeg> returnLegs = new ArrayList<>();
            for (int i = 0; i < command.getItinerary().getReturnFlights().size(); i++) {
                String flightId = command.getItinerary().getReturnFlights().get(i).getId();
                Flight flight = flightRepository.findById(flightId)
                        .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + flightId));
                FlightLeg leg = new FlightLeg();
                leg.setFlight(flight);
                leg.setLegNumber(i + 1);
                returnLegs.add(leg);
            }
            booking.setReturnFlightLegs(returnLegs);
        }

        return bookingRepository.save(booking);
    }

    // Added method to update a booking
    @Transactional
    public Booking updateBooking(Long id, Booking bookingDetails) {
        Optional<Booking> optionalBooking = bookingRepository.findById(id);
        if (!optionalBooking.isPresent()) {
            throw new IllegalArgumentException("Booking with ID " + id + " not found");
        }

        Booking existingBooking = optionalBooking.get();
        existingBooking.setUserId(bookingDetails.getUserId());
        existingBooking.setTotalPrice(bookingDetails.getTotalPrice());
        existingBooking.setFareType(bookingDetails.getFareType());
        existingBooking.setUserDetails(bookingDetails.getUserDetails());
        existingBooking.setSelectedSeat(bookingDetails.getSelectedSeat());
        existingBooking.setStatus(bookingDetails.getStatus());

        // Update flight legs if provided
        if (bookingDetails.getFlightLegs() != null && !bookingDetails.getFlightLegs().isEmpty()) {
            List<FlightLeg> updatedFlightLegs = new ArrayList<>();
            for (int i = 0; i < bookingDetails.getFlightLegs().size(); i++) {
                FlightLeg legDetails = bookingDetails.getFlightLegs().get(i);
                String flightId = legDetails.getFlight().getId();
                Flight flight = flightRepository.findById(flightId)
                        .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + flightId));
                FlightLeg leg = new FlightLeg();
                leg.setFlight(flight);
                leg.setLegNumber(i + 1);
                updatedFlightLegs.add(leg);
            }
            existingBooking.setFlightLegs(updatedFlightLegs);
        }

        // Update return flight legs if provided
        if (bookingDetails.getReturnFlightLegs() != null) {
            List<FlightLeg> updatedReturnLegs = new ArrayList<>();
            for (int i = 0; i < bookingDetails.getReturnFlightLegs().size(); i++) {
                FlightLeg legDetails = bookingDetails.getReturnFlightLegs().get(i);
                String flightId = legDetails.getFlight().getId();
                Flight flight = flightRepository.findById(flightId)
                        .orElseThrow(() -> new IllegalArgumentException("Flight not found: " + flightId));
                FlightLeg leg = new FlightLeg();
                leg.setFlight(flight);
                leg.setLegNumber(i + 1);
                updatedReturnLegs.add(leg);
            }
            existingBooking.setReturnFlightLegs(updatedReturnLegs);
        }

        existingBooking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(existingBooking);
    }

    // Added method to delete a booking
    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new IllegalArgumentException("Booking with ID " + id + " not found");
        }
        bookingRepository.deleteById(id);
    }

// get booking by id
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
               .orElseThrow(() -> new IllegalArgumentException("Booking with ID " + id + " not found"));
    }

    // New method to save a booking
    @Transactional
    public Booking save(Booking booking) {
        return bookingRepository.save(booking);
    }

}