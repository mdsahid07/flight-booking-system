package edu.miu.cs.cs425.backend.application.queryhandler;

import edu.miu.cs.cs425.backend.application.query.FlightRouteSearchQuery;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import edu.miu.cs.cs425.backend.domain.entity.FlightSearchResult;
import edu.miu.cs.cs425.backend.domain.entity.Itinerary;
import edu.miu.cs.cs425.backend.domain.entity.RoundTripItinerary;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FlightRouteSearchQueryHandler {

    private final FlightRepository flightRepository;

    public FlightRouteSearchQueryHandler(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public FlightSearchResult handle(FlightRouteSearchQuery query) {
        FlightSearchResult result = new FlightSearchResult();

        // Validate required parameters
        if (query.getStartAirport() == null || query.getDestinationAirport() == null || query.getStartDate() == null) {
            throw new IllegalArgumentException("Start airport, destination airport, and start date are required");
        }

        LocalDateTime startOfDay = query.getStartDate().atStartOfDay();
        LocalDateTime endOfDay = query.getStartDate().atTime(23, 59, 59);

        // Find outbound itineraries
        List<Itinerary> outboundItineraries = findItineraries(query.getStartAirport(), query.getDestinationAirport(), startOfDay, endOfDay);
        validateItineraries(outboundItineraries, query.getStartAirport(), query.getDestinationAirport());

        if (query.getEndDate() == null) {
            // One-way trip: Sort outbound itineraries by filter criterion
            applySorting(outboundItineraries, query.getFilter());
            result.setOneWayItineraries(outboundItineraries);
        } else {
            // Round trip: Find return itineraries and pair with outbound
            LocalDateTime returnStartOfDay = query.getEndDate().atStartOfDay();
            LocalDateTime returnEndOfDay = query.getEndDate().atTime(23, 59, 59);
            List<Itinerary> returnItineraries = findItineraries(query.getDestinationAirport(), query.getStartAirport(), returnStartOfDay, returnEndOfDay);
            validateItineraries(returnItineraries, query.getDestinationAirport(), query.getStartAirport());

            List<RoundTripItinerary> roundTripItineraries = pairItineraries(outboundItineraries, returnItineraries);
            if (!roundTripItineraries.isEmpty()) {
                applySorting(roundTripItineraries, query.getFilter());
                result.setRoundTripItineraries(roundTripItineraries);
            }
        }

        return result;
    }

    private List<Itinerary> findItineraries(String startAirport, String destinationAirport, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        List<Itinerary> itineraries = new ArrayList<>();

        // Direct flights
        List<Flight> directFlights = flightRepository.findByOrigin_IataCodeAndDestination_IataCodeAndDepartureBetween(
                startAirport, destinationAirport, startDateTime, endDateTime);
        for (Flight flight : directFlights) {
            Itinerary itinerary = new Itinerary();
            List<Flight> flights = new ArrayList<>();
            flights.add(flight);
            itinerary.setFlights(flights);
            itinerary.setTotalPrice(flight.getPrice());
            itinerary.setTotalDuration(flight.getDuration());
            itineraries.add(itinerary);
        }

        // Connecting flights (one layover)
        List<Flight> allFlightsInRange = flightRepository.findAll().stream()
                .filter(flight -> !flight.getDeparture().isBefore(startDateTime) && !flight.getDeparture().isAfter(endDateTime))
                .collect(Collectors.toList());

        List<Flight> firstLegFlights = allFlightsInRange.stream()
                .filter(flight -> flight.getOrigin().getIataCode().equals(startAirport))
                .collect(Collectors.toList());

        for (Flight firstLeg : firstLegFlights) {
            String intermediateAirport = firstLeg.getDestination().getIataCode();
            LocalDateTime firstLegArrival = firstLeg.getArrival();

            List<Flight> secondLegFlights = allFlightsInRange.stream()
                    .filter(flight -> flight.getOrigin().getIataCode().equals(intermediateAirport))
                    .filter(flight -> flight.getDestination().getIataCode().equals(destinationAirport))
                    .filter(flight -> flight.getDeparture().isAfter(firstLegArrival.plusMinutes(30))) // Minimum layover: 30 minutes
                    .filter(flight -> flight.getDeparture().isBefore(firstLegArrival.plusHours(6))) // Maximum layover: 6 hours
                    .collect(Collectors.toList());

            for (Flight secondLeg : secondLegFlights) {
                Itinerary itinerary = new Itinerary();
                List<Flight> flights = new ArrayList<>();
                flights.add(firstLeg);
                flights.add(secondLeg);
                itinerary.setFlights(flights);
                itinerary.setTotalPrice(firstLeg.getPrice() + secondLeg.getPrice());
                itinerary.setTotalDuration(firstLeg.getDuration() + secondLeg.getDuration());
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
                throw new IllegalStateException("Itinerary does not start at " + expectedStart + " or end at " + expectedEnd +
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
                roundTrip.setTotalPrice(outbound.getTotalPrice() + returnTrip.getTotalPrice());
                roundTrip.setTotalDuration(outbound.getTotalDuration() + returnTrip.getTotalDuration());
                roundTripItineraries.add(roundTrip);
            }
        }
        return roundTripItineraries;
    }

    private <T> void applySorting(List<T> itineraries, String filter) {
        if ("fastest".equalsIgnoreCase(filter)) {
            itineraries.sort((o1, o2) -> {
                if (o1 instanceof Itinerary && o2 instanceof Itinerary) {
                    return Integer.compare(((Itinerary) o1).getTotalDuration(), ((Itinerary) o2).getTotalDuration());
                } else if (o1 instanceof RoundTripItinerary && o2 instanceof RoundTripItinerary) {
                    return Integer.compare(((RoundTripItinerary) o1).getTotalDuration(),
                            ((RoundTripItinerary) o2).getTotalDuration());
                }
                return 0;
            });
        } else if ("cheapest".equalsIgnoreCase(filter)) {
            itineraries.sort((o1, o2) -> {
                if (o1 instanceof Itinerary && o2 instanceof Itinerary) {
                    return Double.compare(((Itinerary) o1).getTotalPrice(), ((Itinerary) o2).getTotalPrice());
                } else if (o1 instanceof RoundTripItinerary && o2 instanceof RoundTripItinerary) {
                    return Double.compare(((RoundTripItinerary) o1).getTotalPrice(),
                            ((RoundTripItinerary) o2).getTotalPrice());
                }
                return 0;
            });
        } else {
            itineraries.sort((o1, o2) -> {
                if (o1 instanceof Itinerary && o2 instanceof Itinerary) {
                    return Double.compare(((Itinerary) o1).getTotalPrice(), ((Itinerary) o2).getTotalPrice());
                } else if (o1 instanceof RoundTripItinerary && o2 instanceof RoundTripItinerary) {
                    return Double.compare(((RoundTripItinerary) o1).getTotalPrice(),
                            ((RoundTripItinerary) o2).getTotalPrice());
                }
                return 0;
            }); // Default
        }
    }
}