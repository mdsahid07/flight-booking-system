package edu.miu.cs.cs425.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class CustomJwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Autowired
    public CustomJwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        // Get the context path and request URI
        String contextPath = request.getContextPath(); // Returns "/api"
        String requestURI = request.getRequestURI();   // Returns e.g., "/api/swagger-ui.html"
        String relativePath = requestURI.substring(contextPath.length());

        // Allow all requests to proceed (no token validation)
        // Optional: Process token if present for attribute setting
        String authHeader = request.getHeader("Authorization");
        String token = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                request.setAttribute("email", email);
                request.setAttribute("role", role);
            }
        }

        // Continue the filter chain for all requests
        chain.doFilter(request, response);
    }
}