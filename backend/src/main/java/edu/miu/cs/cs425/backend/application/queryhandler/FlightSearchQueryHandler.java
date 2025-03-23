package edu.miu.cs.cs425.backend.application.queryhandler;

import edu.miu.cs.cs425.backend.application.query.FlightSearchQuery;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.domain.entity.FlightSearchResult;
import edu.miu.cs.cs425.backend.domain.entity.Itinerary;
import edu.miu.cs.cs425.backend.domain.entity.RoundTripItinerary;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class FlightSearchQueryHandler {
    private final FlightRepository flightRepository;

    public FlightSearchQueryHandler(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public FlightSearchResult handle(FlightSearchQuery query) {
        FlightSearchResult result = new FlightSearchResult();

        // Validate required parameters
        if (query.getStartAirport() == null || query.getDestinationAirport() == null || query.getStartDate() == null) {
            throw new IllegalArgumentException("Start airport, destination airport, and start date are required");
        }

        // Step 1: Find outbound itineraries (startAirport to destinationAirport)
        List<Itinerary> outboundItineraries = findItineraries(query.getStartAirport(), query.getDestinationAirport(), query.getStartDate());
        validateItineraries(outboundItineraries, query.getStartAirport(), query.getDestinationAirport());

        if (query.getReturnDate() == null) {
            // One-way trip: Sort outbound itineraries by filter criterion
            if ("fastest".equalsIgnoreCase(query.getFilter())) {
                outboundItineraries.sort(Comparator.comparingInt(Itinerary::getTotalDuration));
            } else if ("cheapest".equalsIgnoreCase(query.getFilter())) {
                outboundItineraries.sort(Comparator.comparingDouble(Itinerary::getTotalPrice));
            } else {
                outboundItineraries.sort(Comparator.comparingDouble(Itinerary::getTotalPrice)); // Default
            }
            result.setOneWayItineraries(outboundItineraries);
        } else {
            // Round trip: Find return itineraries and pair with outbound
            List<Itinerary> returnItineraries = findItineraries(query.getDestinationAirport(), query.getStartAirport(), query.getReturnDate());
            validateItineraries(returnItineraries, query.getDestinationAirport(), query.getStartAirport());

            List<RoundTripItinerary> roundTripItineraries = pairItineraries(outboundItineraries, returnItineraries);
            if (!roundTripItineraries.isEmpty()) {
                // Sort round-trip itineraries by filter criterion
                if ("fastest".equalsIgnoreCase(query.getFilter())) {
                    roundTripItineraries.sort(Comparator.comparingInt(RoundTripItinerary::getTotalDuration));
                } else if ("cheapest".equalsIgnoreCase(query.getFilter())) {
                    roundTripItineraries.sort(Comparator.comparingDouble(RoundTripItinerary::getTotalPrice));
                } else {
                    roundTripItineraries.sort(Comparator.comparingDouble(RoundTripItinerary::getTotalPrice)); // Default
                }
                result.setRoundTripItineraries(roundTripItineraries);
            }
        }

        return result;
    }

    private List<Itinerary> findItineraries(String startAirport, String destinationAirport, LocalDate date) {
        List<Itinerary> itineraries = new ArrayList<>();

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Direct flights
        List<Flight> directFlights = flightRepository.findByOrigin_IataCodeAndDestination_IataCodeAndDepartureBetween(
                startAirport, destinationAirport, startOfDay, endOfDay);
        for (Flight flight : directFlights) {
            Itinerary itinerary = new Itinerary();
            itinerary.getFlights().add(flight);
            itinerary.calculateTotals();
            itineraries.add(itinerary);
        }

        // Connecting flights (one layover)
        List<Flight> allFlightsOnDate = flightRepository.findAll().stream()
                .filter(flight -> flight.getDeparture().toLocalDate().equals(date))
                .collect(Collectors.toList());

        List<Flight> firstLegFlights = allFlightsOnDate.stream()
                .filter(flight -> flight.getOrigin().getIataCode().equals(startAirport))
                .collect(Collectors.toList());

        for (Flight firstLeg : firstLegFlights) {
            String intermediateAirport = firstLeg.getDestination().getIataCode();
            LocalDateTime firstLegArrival = firstLeg.getArrival();

            List<Flight> secondLegFlights = allFlightsOnDate.stream()
                    .filter(flight -> flight.getOrigin().getIataCode().equals(intermediateAirport))
                    .filter(flight -> flight.getDestination().getIataCode().equals(destinationAirport))
                    .filter(flight -> flight.getDeparture().isAfter(firstLegArrival.plusMinutes(30))) // Minimum layover: 30 minutes
                    .filter(flight -> flight.getDeparture().isBefore(firstLegArrival.plusHours(6))) // Maximum layover: 6 hours
                    .collect(Collectors.toList());

            for (Flight secondLeg : secondLegFlights) {
                Itinerary itinerary = new Itinerary();
                itinerary.getFlights().add(firstLeg);
                itinerary.getFlights().add(secondLeg);
                itinerary.calculateTotals();
                itineraries.add(itinerary);
            }
        }

        return itineraries;
    }

    private void validateItineraries(List<Itinerary> itineraries, String expectedStart, String expectedEnd) {
        for (Itinerary itinerary : itineraries) {
            if (itinerary.getFlights().isEmpty()) continue;
            String actualStart = itinerary.getFlights().get(0).getOrigin().getIataCode();
            String actualEnd = itinerary.getFlights().get(itinerary.getFlights().size() - 1).getDestination().getIataCode();
            if (!actualStart.equals(expectedStart) || !actualEnd.equals(expectedEnd)) {
                throw new IllegalStateException("ItineraryCommand does not start at " + expectedStart + " or end at " + expectedEnd +
                        ". Actual: " + actualStart + " to " + actualEnd);
            }
        }
    }

    private List<RoundTripItinerary> pairItineraries(List<Itinerary> outboundItineraries, List<Itinerary> returnItineraries) {
        List<RoundTripItinerary> roundTripItineraries = new ArrayList<>();
        for (Itinerary outbound : outboundItineraries) {
            for (Itinerary returnTrip : returnItineraries) {
                RoundTripItinerary roundTrip = new RoundTripItinerary();
                roundTrip.setOutboundFlights(outbound.getFlights());
                roundTrip.setReturnFlights(returnTrip.getFlights());
                roundTrip.calculateTotals(); // Use calculateTotals() from RoundTripItinerary
                roundTripItineraries.add(roundTrip);
            }
        }
        return roundTripItineraries;
    }
}