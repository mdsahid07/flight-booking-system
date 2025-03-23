package edu.miu.cs.cs425.backend.application.command;

import edu.miu.cs.cs425.backend.domain.entity.BookingStatus;
import edu.miu.cs.cs425.backend.domain.entity.UserDetails;

import java.util.List;

public class CreateBookingCommand {

    private String userId;
    private ItineraryCommand itinerary;
    private Double totalPrice;
    private String fareType;
    private UserDetails userDetails;
    private String selectedSeat;
    private BookingStatus status;
    private String bookingDate;

    // Constructors
    public CreateBookingCommand() {}

    public CreateBookingCommand(String userId, ItineraryCommand itinerary, Double totalPrice, String fareType,
                                UserDetails userDetails, String selectedSeat, BookingStatus status, String bookingDate) {
        this.userId = userId;
        this.itinerary = itinerary;
        this.totalPrice = totalPrice;
        this.fareType = fareType;
        this.userDetails = userDetails;
        this.selectedSeat = selectedSeat;
        this.status = status;
        this.bookingDate = bookingDate;
    }

    // Getters
    public String getUserId() {
        return userId;
    }

    public ItineraryCommand getItinerary() {
        return itinerary;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public String getFareType() {
        return fareType;
    }

    public UserDetails getUserDetails() {
        return userDetails;
    }

    public String getSelectedSeat() {
        return selectedSeat;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public String getBookingDate() {
        return bookingDate;
    }
}