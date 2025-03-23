package edu.miu.cs.cs425.backend.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {

    private final CustomJwtFilter customJwtFilter;

    public FilterConfig(CustomJwtFilter customJwtFilter) {
        this.customJwtFilter = customJwtFilter;
    }

    @Bean
    public FilterRegistrationBean<CustomJwtFilter> jwtFilterRegistration() {
        FilterRegistrationBean<CustomJwtFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(customJwtFilter);
        registrationBean.addUrlPatterns("/api/*"); // Apply to all endpoints under /api
        return registrationBean;
    }
}