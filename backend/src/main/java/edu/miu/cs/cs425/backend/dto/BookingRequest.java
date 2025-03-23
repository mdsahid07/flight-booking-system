package edu.miu.cs.cs425.backend.dto;

import edu.miu.cs.cs425.backend.domain.entity.BookingStatus;
import edu.miu.cs.cs425.backend.domain.entity.UserDetails;

public class BookingRequest {

    private String userId;
    private ItineraryRequest itinerary;
    private Double totalPrice;
    private String fareType;
    private UserDetails userDetails;
    private String selectedSeat;
    private BookingStatus status;
    private String bookingDate;

    // Constructors
    public BookingRequest() {}

    // Getters and setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public ItineraryRequest getItinerary() {
        return itinerary;
    }

    public void setItinerary(ItineraryRequest itinerary) {
        this.itinerary = itinerary;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getFareType() {
        return fareType;
    }

    public void setFareType(String fareType) {
        this.fareType = fareType;
    }

    public UserDetails getUserDetails() {
        return userDetails;
    }

    public void setUserDetails(UserDetails userDetails) {
        this.userDetails = userDetails;
    }

    public String getSelectedSeat() {
        return selectedSeat;
    }

    public void setSelectedSeat(String selectedSeat) {
        this.selectedSeat = selectedSeat;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }
}