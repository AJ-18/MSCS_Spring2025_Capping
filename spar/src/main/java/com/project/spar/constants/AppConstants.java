package com.project.spar.constants;

public final class AppConstants {




    private AppConstants() {
        // restrict instantiation
    }
    public static final int MAX_RETRIES = 3;

    public static final int MAX_PROCESSES = 300;
    public static final String METRIC_SUCCESS = "Metrics saved successfully";
    public static final String METRIC_FAILURE = "Metrics save failed";
    public static final String USER_NOT_FOUND = "User not found";
    public static final String UNKNOWN_USER_ID = "Unknown userId";
    public static final String NOT_REGISTERED_FOR_USER = "not registered for user";
    public static final String AUTHORIZATION = "Authorization";
    public static final String USER_REGISTERED_SUCCESSFULLY= "User registered successfully!";
    public static final String DEVICE = "Device";
    public static final String DEVICE_NOT_REGISTERED = "Device not registered";
    public static final String ERROR_UNAUTHORIZED= "Error: Unauthorized";
    public static final String ERROR_USERNAME_ALREADY_TAKEN = "Error: Username is already taken!";
    public static final String ERROR_EMAIL_ALREADY_USED = "Error: Email is already in use!";

    public static final String ERROR_GENERIC = "Generic Error";
    public static final String ERROR_INVALID_CREDENTIALS = "Invalid Credentials";

    public static final String GENERIC_ERROR = "Generic Error";

    public static final String ERROR_NOT_FOUND = "Not Found";
    public static final String EQUALS_TO = "=";
}