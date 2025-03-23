package edu.miu.cs.cs425.backend.application.queryhandler;

import edu.miu.cs.cs425.backend.application.query.FlightSearchQuery;
import edu.miu.cs.cs425.backend.data.repository.BookingRepository;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.domain.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingQueryHandler {

    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public BookingQueryHandler(FlightRepository flightRepository, BookingRepository bookingRepository) {
        this.flightRepository = flightRepository;
        this.bookingRepository = bookingRepository;
    }

    public Optional<Flight> getFlight(String flightId) {
        return flightRepository.findById(flightId);
    }

    public FlightSearchResult searchFlights(FlightSearchQuery query) {
        List<Flight> allFlights = flightRepository.findAll();

        // Filter outbound flights
        List<Flight> outboundFlights = allFlights.stream()
                .filter(flight -> {
                    boolean matchesStart = query.getStartAirport() == null || flight.getOrigin().getIataCode().equals(query.getStartAirport());
                    boolean matchesDest = query.getDestinationAirport() == null || flight.getDestination().getIataCode().equals(query.getDestinationAirport());
                    boolean matchesDate = query.getStartDate() == null || flight.getDeparture().toLocalDate().equals(query.getStartDate());
                    return matchesStart && matchesDest && matchesDate;
                })
                .collect(Collectors.toList());

        // Build one-way itineraries using external Itinerary class
        List<Itinerary> oneWayItineraries = outboundFlights.stream()
                .map(flight -> {
                    Itinerary itinerary = new Itinerary();
                    itinerary.setFlights(List.of(flight));
                    itinerary.setTotalPrice(flight.getPrice());
                    itinerary.setTotalDuration(flight.getDuration());
                    return itinerary;
                })
                .collect(Collectors.toList());

        // Filter return flights (for round trips)
        List<RoundTripItinerary> roundTripItineraries = new ArrayList<>();
        if (query.getReturnDate() != null) {
            List<Flight> returnFlights = allFlights.stream()
                    .filter(flight -> {
                        boolean matchesStart = query.getDestinationAirport() == null || flight.getOrigin().getIataCode().equals(query.getDestinationAirport());
                        boolean matchesDest = query.getStartAirport() == null || flight.getDestination().getIataCode().equals(query.getStartAirport());
                        boolean matchesDate = flight.getDeparture().toLocalDate().equals(query.getReturnDate());
                        return matchesStart && matchesDest && matchesDate;
                    })
                    .collect(Collectors.toList());

            // Combine outbound and return flights into round-trip itineraries
            for (Flight outbound : outboundFlights) {
                for (Flight returnFlight : returnFlights) {
                    if (outbound.getArrival().isBefore(returnFlight.getDeparture())) { // Ensure return is after outbound
                        RoundTripItinerary roundTrip = new RoundTripItinerary();
                        roundTrip.setOutboundFlights(List.of(outbound));
                        roundTrip.setReturnFlights(List.of(returnFlight));
                        roundTrip.setTotalPrice(outbound.getPrice() + returnFlight.getPrice());
                        roundTrip.setTotalDuration(outbound.getDuration() + returnFlight.getDuration());
                        roundTripItineraries.add(roundTrip);
                    }
                }
            }
        }

        // Sort based on filter criterion
        if ("cheapest".equals(query.getFilter())) {
            oneWayItineraries.sort(Comparator.comparingDouble(Itinerary::getTotalPrice));
            roundTripItineraries.sort(Comparator.comparingDouble(RoundTripItinerary::getTotalPrice));
        } else if ("fastest".equals(query.getFilter())) {
            oneWayItineraries.sort(Comparator.comparingInt(Itinerary::getTotalDuration));
            roundTripItineraries.sort(Comparator.comparingInt(RoundTripItinerary::getTotalDuration));
        }

        // Build result
        FlightSearchResult result = new FlightSearchResult();
        result.setOneWayItineraries(oneWayItineraries);
        result.setRoundTripItineraries(roundTripItineraries);

        return result;
    }

    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Added method to fetch all bookings for admin use
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // New method to get a booking by ID
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }
}