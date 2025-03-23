package edu.miu.cs.cs425.backend.domain.entity;

import edu.miu.cs.cs425.backend.data.repository.AirlineRepository;
import edu.miu.cs.cs425.backend.data.repository.AirportRepository;
import edu.miu.cs.cs425.backend.data.repository.BookingRepository;
import edu.miu.cs.cs425.backend.data.repository.FlightRepository;
import edu.miu.cs.cs425.backend.data.repository.RoleRepository;
import edu.miu.cs.cs425.backend.data.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AirlineRepository airlineRepository;
    private final AirportRepository airportRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final RoleRepository roleRepository;

    private final List<String> countries = Arrays.asList("USA", "Canada", "UK", "France");
    private final List<String> cities = Arrays.asList("New York", "Toronto", "London", "Paris");
    private final List<String> airportNames = Arrays.asList(
            "John F. Kennedy International Airport", "Toronto Pearson International Airport",
            "London Heathrow Airport", "Charles de Gaulle Airport"
    );
    private final List<String> airportCodes = Arrays.asList("JFK", "YYZ", "LHR", "CDG");
    private final List<String> firstNames = List.of("John");
    private final List<String> lastNames = List.of("Doe");

    @Autowired
    public DataInitializer(AirlineRepository airlineRepository, AirportRepository airportRepository,
                           UserRepository userRepository, FlightRepository flightRepository,
                           BookingRepository bookingRepository, RoleRepository roleRepository) {
        this.airlineRepository = airlineRepository;
        this.airportRepository = airportRepository;
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.bookingRepository = bookingRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        airlineRepository.deleteAll();
        airportRepository.deleteAll();
        userRepository.deleteAll();
        flightRepository.deleteAll();
        bookingRepository.deleteAll();
        roleRepository.deleteAll(); // Clear roles table

        // Populate Roles
        List<Role> roles = new ArrayList<>();
        Role userRole = new Role("USER");
        Role adminRole = new Role("ADMIN");
        roles.add(userRole);
        roles.add(adminRole);
        roleRepository.saveAll(roles);

        // Populate Airlines (minimal set)
        List<Airline> airlines = new ArrayList<>();
        String[] airlineNames = {"Delta Airlines", "British Airways", "Air Canada", "Air France"};
        for (int i = 0; i < airlineNames.length; i++) {
            Airline airline = new Airline();
            airline.setCode("AIR" + String.format("%03d", i + 1));
            airline.setName(airlineNames[i]);
            airlines.add(airline);
        }
        airlineRepository.saveAll(airlines);

        // Populate Airports (only those needed for JFK to LHR)
        List<Airport> airports = new ArrayList<>();
        for (int i = 0; i < airportCodes.size(); i++) {
            Airport airport = new Airport();
            airport.setIataCode(airportCodes.get(i));
            airport.setName(airportNames.get(i));
            airport.setCity(cities.get(i));
            airport.setCountry(countries.get(i));
            airports.add(airport);
        }
        airportRepository.saveAll(airports);

        // Populate Users (minimal: 1 user with roles)
        List<User> users = new ArrayList<>();
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName("Mercel Vubangsi");
        user.setEmail("vmercel@gmail.com");
        user.setPassword(BCrypt.hashpw("marvel", BCrypt.gensalt()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User user2 = new User();
        user2.setId(UUID.randomUUID().toString());
        user2.setName("Darian Kezong");
        user2.setEmail("vmercel@outlook.fr");
        user2.setPassword(BCrypt.hashpw("marvel", BCrypt.gensalt()));
        user2.setCreatedAt(LocalDateTime.now());
        user2.setUpdatedAt(LocalDateTime.now());
        // Assign roles
        user.addRole(userRole); // Add USER role
        user.addRole(adminRole); // Add ADMIN role
        user2.addRole(adminRole); // Add ADMIN role
        users.add(user);
        users.add(user2);
        userRepository.saveAll(users);

        // Populate Flights with explicit JFK to LHR cases (March 12, 2025)
        List<Flight> flights = new ArrayList<>();
        LocalDateTime baseDate = LocalDateTime.of(2025, 3, 12, 8, 0);

        // Case 1: Direct (No legs)
        Flight directFlight = createFlight(
                airports.get(0), // JFK
                airports.get(2), // LHR
                baseDate,        // 08:00
                420,             // 7 hours
                airlines.get(1)  // British Airways
        );
        flights.add(directFlight);

        // Case 2: 2-leg (JFK → YYZ → LHR)
        Flight jfkToYyz = createFlight(
                airports.get(0), // JFK
                airports.get(1), // YYZ
                baseDate.plusHours(1), // 09:00
                90,             // 1.5 hours
                airlines.get(2) // Air Canada
        );
        flights.add(jfkToYyz);
        Flight yyzToLhr = createFlight(
                airports.get(1), // YYZ
                airports.get(2), // LHR
                jfkToYyz.getArrival().plusHours(1), // 11:30 (1-hour layover)
                420,            // 7 hours
                airlines.get(1) // British Airways
        );
        flights.add(yyzToLhr);

        // Case 3: 3-leg (JFK → YYZ → CDG → LHR)
        Flight jfkToYyz3Leg = createFlight(
                airports.get(0), // JFK
                airports.get(1), // YYZ
                baseDate.plusHours(2), // 10:00
                90,             // 1.5 hours
                airlines.get(2) // Air Canada
        );
        flights.add(jfkToYyz3Leg);
        Flight yyzToCdg = createFlight(
                airports.get(1), // YYZ
                airports.get(3), // CDG
                jfkToYyz3Leg.getArrival().plusHours(1), // 12:30 (1-hour layover)
                360,            // 6 hours
                airlines.get(3) // Air France
        );
        flights.add(yyzToCdg);
        Flight cdgToLhr = createFlight(
                airports.get(3), // CDG
                airports.get(2), // LHR
                yyzToCdg.getArrival().plusHours(1), // 19:30 (1-hour layover)
                60,             // 1 hour
                airlines.get(1) // British Airways
        );
        flights.add(cdgToLhr);

        flightRepository.saveAll(flights);

        // Debug output
        System.out.println("Data initialized successfully!");
        System.out.println("Airlines: " + airlines.size());
        System.out.println("Airports: " + airports.size());
        System.out.println("Users: " + users.size());
        System.out.println("Roles: " + roles.size());
        System.out.println("Flights: " + flights.size());
        System.out.println("\nJFK to LHR Explicit Entries (March 12, 2025):");
        System.out.println("Direct (No Legs):");
        System.out.println("  " + directFlight.getOrigin().getIataCode() + " → " +
                directFlight.getDestination().getIataCode() + " @ " +
                directFlight.getDeparture() + " - " + directFlight.getArrival());
        System.out.println("2-Leg (JFK → YYZ → LHR):");
        System.out.println("  " + jfkToYyz.getOrigin().getIataCode() + " → " +
                jfkToYyz.getDestination().getIataCode() + " @ " +
                jfkToYyz.getDeparture() + " - " + jfkToYyz.getArrival());
        System.out.println("  " + yyzToLhr.getOrigin().getIataCode() + " → " +
                yyzToLhr.getDestination().getIataCode() + " @ " +
                yyzToLhr.getDeparture() + " - " + yyzToLhr.getArrival());
        System.out.println("3-Leg (JFK → YYZ → CDG → LHR):");
        System.out.println("  " + jfkToYyz3Leg.getOrigin().getIataCode() + " → " +
                jfkToYyz3Leg.getDestination().getIataCode() + " @ " +
                jfkToYyz3Leg.getDeparture() + " - " + jfkToYyz3Leg.getArrival());
        System.out.println("  " + yyzToCdg.getOrigin().getIataCode() + " → " +
                yyzToCdg.getDestination().getIataCode() + " @ " +
                yyzToCdg.getDeparture() + " - " + yyzToCdg.getArrival());
        System.out.println("  " + cdgToLhr.getOrigin().getIataCode() + " → " +
                cdgToLhr.getDestination().getIataCode() + " @ " +
                cdgToLhr.getDeparture() + " - " + cdgToLhr.getArrival());
    }

    private Flight createFlight(Airport origin, Airport destination, LocalDateTime departure, int duration, Airline airline) {
        Flight flight = new Flight();
        flight.setId(UUID.randomUUID().toString());
        flight.setFlightNumber("FL" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        flight.setAirline(airline);
        flight.setOrigin(origin);
        flight.setDestination(destination);
        flight.setDeparture(departure);
        flight.setArrival(departure.plusMinutes(duration));
        flight.setDuration(duration);
        flight.setPrice(100 + (duration / 60.0) * 50); // Price based on flight hours
        flight.setSeatsAvailable(50); // Fixed for simplicity
        return flight;
    }
}