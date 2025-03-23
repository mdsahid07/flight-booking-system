package edu.miu.cs.cs425.backend.service;

import edu.miu.cs.cs425.backend.application.query.FlightRouteSearchQuery;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.domain.entity.Flight;
import edu.miu.cs.cs425.backend.domain.entity.FlightSearchResult;
import edu.miu.cs.cs425.backend.domain.entity.Itinerary;
import edu.miu.cs.cs425.backend.domain.entity.RoundTripItinerary;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FlightService {

    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    // CRUD Operations
    public Flight createFlight(Flight flight) {
        return flightRepository.save(flight);
    }

    public Optional<Flight> findFlightById(String id) {
        return flightRepository.findById(id);
    }

    public List<Flight> findAllFlights() {
        return flightRepository.findAll();
    }

    public Flight updateFlight(String id, Flight flightDetails) {
        return flightRepository.findById(id)
                .map(flight -> {
                    flight.setOrigin(flightDetails.getOrigin());
                    flight.setDestination(flightDetails.getDestination());
                    flight.setDeparture(flightDetails.getDeparture());
                    flight.setArrival(flightDetails.getArrival());
                    flight.setAirline(flightDetails.getAirline());
                    flight.setFlightNumber(flightDetails.getFlightNumber());
                    flight.setDuration(flightDetails.getDuration());
                    flight.setPrice(flightDetails.getPrice());
                    flight.setSeatsAvailable(flightDetails.getSeatsAvailable());
                    return flightRepository.save(flight);
                })
                .orElseThrow(() -> new IllegalArgumentException("Flight not found with id: " + id));
    }

    public void deleteFlight(String id) {
        flightRepository.findById(id)
                .ifPresentOrElse(
                        flightRepository::delete,
                        () -> { throw new IllegalArgumentException("Flight not found with id: " + id); }
                );
    }

    // Main Search Method
    public FlightSearchResult findFlightsByRoute(FlightRouteSearchQuery query) {
        FlightSearchResult result = new FlightSearchResult();
        List<Flight> allFlights = flightRepository.findAll();

        if (query == null || isQueryEmpty(query)) {
            result.setOneWayItineraries(createOneWayItineraries(allFlights));
            return result;
        }

        // Default to March 12, 2025 if no startDate provided
        LocalDate searchDate = query.getStartDate() != null ? query.getStartDate() : LocalDate.of(2025, 3, 12);
        List<Flight> filteredFlights = filterFlights(allFlights, query.getStartAirport(), query.getDestinationAirport(), searchDate);

        if (query.getEndDate() == null) {
            List<Itinerary> oneWayItineraries = findItineraries(filteredFlights, query.getStartAirport(), query.getDestinationAirport());
            applySorting(oneWayItineraries, query.getFilter());
            result.setOneWayItineraries(oneWayItineraries);
        } else {
            // Round-trip logic
            List<Flight> outboundFlights = filterFlights(allFlights, query.getStartAirport(), query.getDestinationAirport(), query.getStartDate());
            List<Itinerary> outboundItineraries = findItineraries(outboundFlights, query.getStartAirport(), query.getDestinationAirport());

            List<Flight> returnFlights = filterFlights(allFlights, query.getDestinationAirport(), query.getStartAirport(), query.getEndDate());
            List<Itinerary> returnItineraries = findItineraries(returnFlights, query.getDestinationAirport(), query.getStartAirport());

            List<RoundTripItinerary> roundTripItineraries = combineRoundTrips(outboundItineraries, returnItineraries);
            applySortingForRoundTrip(roundTripItineraries, query.getFilter());
            result.setRoundTripItineraries(roundTripItineraries);
        }

        return result;
    }

    public List<Flight> findFlightsByAirline(String airlineCode, String filterCriterion) {
        List<Flight> flights = flightRepository.findByAirline_Code(airlineCode);
        if ("fastest".equals(filterCriterion)) {
            flights.sort(Comparator.comparingInt(Flight::getDuration));
        } else if ("cheapest".equals(filterCriterion)) {
            flights.sort(Comparator.comparingDouble(Flight::getPrice));
        }
        return flights;
    }

    // Helper Methods
    private boolean isQueryEmpty(FlightRouteSearchQuery query) {
        return query.getStartAirport() == null && query.getDestinationAirport() == null &&
                query.getStartDate() == null && query.getEndDate() == null && query.getFilter() == null;
    }

    private List<Flight> filterFlights(List<Flight> flights, String startAirport, String destinationAirport, LocalDate date) {
        // Filter only by date to include all possible legs, let DFS handle start/destination
        return flights.stream()
                .filter(f -> date == null || (
                        !f.getDeparture().isBefore(date.atStartOfDay()) &&
                                !f.getDeparture().isAfter(date.atTime(LocalTime.MAX))))
                .collect(Collectors.toList());
    }

    private List<Itinerary> findItineraries(List<Flight> flights, String startAirport, String destinationAirport) {
        List<Itinerary> itineraries = new ArrayList<>();
        if (startAirport == null || destinationAirport == null) {
            return createOneWayItineraries(flights);
        }

        // Build graph
        Map<String, List<Flight>> graph = new HashMap<>();
        for (Flight flight : flights) {
            graph.computeIfAbsent(flight.getOrigin().getIataCode(), k -> new ArrayList<>()).add(flight);
        }
        System.out.println("Graph for " + startAirport + " to " + destinationAirport + ": " + graph);

        // Find all paths
        List<List<Flight>> allPaths = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        findPathsDFS(graph, startAirport, destinationAirport, new ArrayList<>(), allPaths, visited, 3);

        // Convert paths to itineraries
        for (List<Flight> path : allPaths) {
            Itinerary itinerary = new Itinerary();
            itinerary.setFlights(path);
            itinerary.calculateTotals();
            itineraries.add(itinerary);
        }
        System.out.println("Found itineraries: " + itineraries);
        return itineraries;
    }

    private void findPathsDFS(Map<String, List<Flight>> graph, String currentAirport, String destinationAirport,
                              List<Flight> currentPath, List<List<Flight>> allPaths, Set<String> visited, int maxLegs) {
        if (currentPath.size() > maxLegs) return;

        // Explore all flights from currentAirport
        List<Flight> flights = graph.getOrDefault(currentAirport, Collections.emptyList());
        for (Flight flight : flights) {
            String nextAirport = flight.getDestination().getIataCode();
            if (visited.contains(nextAirport)) continue;
            if (!currentPath.isEmpty()) {
                LocalDateTime lastArrival = currentPath.get(currentPath.size() - 1).getArrival();
                if (!flight.getDeparture().isAfter(lastArrival)) continue;
            }

            currentPath.add(flight);
            visited.add(nextAirport);

            // If we’ve reached the destination, add the path
            if (nextAirport.equals(destinationAirport)) {
                allPaths.add(new ArrayList<>(currentPath));
            }

            // Continue exploring for more legs
            findPathsDFS(graph, nextAirport, destinationAirport, currentPath, allPaths, visited, maxLegs);

            currentPath.remove(currentPath.size() - 1);
            visited.remove(nextAirport);
        }

        // Add direct flights only when starting from startAirport
        if (currentPath.isEmpty()) {
            List<Flight> directFlights = graph.getOrDefault(currentAirport, Collections.emptyList())
                    .stream()
                    .filter(f -> f.getDestination().getIataCode().equals(destinationAirport))
                    .collect(Collectors.toList());
            for (Flight direct : directFlights) {
                allPaths.add(Collections.singletonList(direct));
            }
        }
    }

    private List<Itinerary> createOneWayItineraries(List<Flight> flights) {
        List<Itinerary> itineraries = new ArrayList<>();
        for (Flight flight : flights) {
            Itinerary itinerary = new Itinerary();
            itinerary.setFlights(new ArrayList<>(Collections.singletonList(flight))); // Initialize and add flight
            itinerary.calculateTotals();
            itineraries.add(itinerary);
        }
        return itineraries;
    }

    private List<RoundTripItinerary> combineRoundTrips(List<Itinerary> outboundItineraries, List<Itinerary> returnItineraries) {
        List<RoundTripItinerary> roundTripItineraries = new ArrayList<>();
        for (Itinerary outbound : outboundItineraries) {
            for (Itinerary returnItinerary : returnItineraries) {
                Flight lastOutbound = outbound.getFlights().get(outbound.getFlights().size() - 1);
                Flight firstReturn = returnItinerary.getFlights().get(0);
                if (firstReturn.getDeparture().isAfter(lastOutbound.getArrival())) {
                    RoundTripItinerary roundTrip = new RoundTripItinerary();
                    roundTrip.setOutboundFlights(outbound.getFlights());
                    roundTrip.setReturnFlights(returnItinerary.getFlights());
                    roundTrip.setTotalPrice(outbound.getTotalPrice() + returnItinerary.getTotalPrice());
                    roundTrip.setTotalDuration(outbound.getTotalDuration() + returnItinerary.getTotalDuration());
                    roundTripItineraries.add(roundTrip);
                }
            }
        }
        return roundTripItineraries;
    }

    private void applySorting(List<Itinerary> itineraries, String filter) {
        if ("fastest".equals(filter)) {
            itineraries.sort(Comparator.comparingInt(Itinerary::getTotalDuration));
        } else if ("cheapest".equals(filter)) {
            itineraries.sort(Comparator.comparingDouble(Itinerary::getTotalPrice));
        }
    }

    private void applySortingForRoundTrip(List<RoundTripItinerary> itineraries, String filter) {
        if ("fastest".equals(filter)) {
            itineraries.sort(Comparator.comparingInt(RoundTripItinerary::getTotalDuration));
        } else if ("cheapest".equals(filter)) {
            itineraries.sort(Comparator.comparingDouble(RoundTripItinerary::getTotalPrice));
        }
    }
}