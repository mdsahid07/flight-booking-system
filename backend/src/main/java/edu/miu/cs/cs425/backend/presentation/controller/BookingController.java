package edu.miu.cs.cs425.backend.presentation.controller;

import edu.miu.cs.cs425.backend.application.command.CreateBookingCommand;
import edu.miu.cs.cs425.backend.application.commandhandler.BookingCommandHandler;
import edu.miu.cs.cs425.backend.application.query.FlightSearchQuery;
import edu.miu.cs.cs425.backend.application.queryhandler.BookingQueryHandler;
import edu.miu.cs.cs425.backend.domain.entity.Booking;
import edu.miu.cs.cs425.backend.domain.entity.BookingStatus;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import edu.miu.cs.cs425.backend.domain.entity.FlightSearchResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/booking")
@CrossOrigin(origins = {"http://localhost:3000"}, allowedHeaders = "*", allowCredentials = "true")
@Tag(name = "Booking API", description = "Endpoints for managing flight bookings")
public class BookingController {

    private final BookingCommandHandler bookingCommandHandler;
    private final BookingQueryHandler bookingQueryHandler;

    @Autowired
    public BookingController(BookingCommandHandler bookingCommandHandler, BookingQueryHandler bookingQueryHandler) {
        this.bookingCommandHandler = bookingCommandHandler;
        this.bookingQueryHandler = bookingQueryHandler;
    }

    @Operation(summary = "Create a new booking", description = "Creates a booking for a flight with multiple legs, including user details and fare type.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Booking created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid booking data provided"),
            @ApiResponse(responseCode = "404", description = "Flight or user not found")
    })
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Parameter(description = "Command object containing booking details", required = true)
            @RequestBody CreateBookingCommand command) {
        Booking booking = bookingCommandHandler.handle(command);
        return ResponseEntity.status(201).body(booking);
    }

    @Operation(summary = "Get flight details", description = "Retrieves details of a specific flight by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Flight details retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Flight not found")
    })
    @GetMapping("/flights/{flightId}")
    public ResponseEntity<Optional<Flight>> getFlight(
            @Parameter(description = "ID of the flight to retrieve", required = true)
            @PathVariable String flightId) {
        Optional<Flight> flight = bookingQueryHandler.getFlight(flightId);
        return ResponseEntity.ok(flight);
    }

    @Operation(summary = "Search flights", description = "Searches for flight itineraries based on start airport, destination airport, date, and optional filters. Returns a list of one-way or round-trip itineraries ordered by the filter criterion (fastest or cheapest).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Flight search result containing one-way or round-trip itineraries"),
            @ApiResponse(responseCode = "400", description = "Invalid search query provided")
    })
    @PostMapping("/search")
    public ResponseEntity<FlightSearchResult> searchFlights(
            @Parameter(description = "Query object containing search criteria", required = true)
            @RequestBody FlightSearchQuery query) {
        FlightSearchResult result = bookingQueryHandler.searchFlights(query);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(
            @Parameter(description = "ID of the user to retrieve bookings for", required = true)
            @PathVariable String userId) {
        List<Booking> bookings = bookingQueryHandler.getBookingsByUserId(userId);
        System.out.println("USER BOOKINGS: " + bookings);
        if (bookings.isEmpty()) {
            return ResponseEntity.ok(bookings); // Return empty list instead of 404 for consistency
        }
        return ResponseEntity.ok(bookings);
    }

    @Operation(summary = "Get all bookings", description = "Retrieves a list of all bookings")
    @ApiResponse(responseCode = "200", description = "List of bookings retrieved successfully")
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        List<Booking> bookings = bookingQueryHandler.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @Operation(summary = "Update a booking", description = "Updates an existing booking")
    @ApiResponse(responseCode = "200", description = "Booking updated successfully")
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        Booking updatedBooking = bookingCommandHandler.updateBooking(id, bookingDetails);
        return ResponseEntity.ok(updatedBooking);
    }

    @Operation(summary = "Cancel a booking", description = "Cancels an existing booking by updating its status to CANCELLED")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Booking is already cancelled"),
            @ApiResponse(responseCode = "404", description = "Booking not found")
    })
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingQueryHandler.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        if (BookingStatus.CANCELLED.equals(booking.getStatus())) {
            return ResponseEntity.badRequest().body(booking); // Already cancelled
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updatedBooking = bookingCommandHandler.save(booking);
        return ResponseEntity.ok(updatedBooking);
    }

    @Operation(summary = "Delete a booking", description = "Deletes a booking by its ID")
    @ApiResponse(responseCode = "204", description = "Booking deleted successfully")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingCommandHandler.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}