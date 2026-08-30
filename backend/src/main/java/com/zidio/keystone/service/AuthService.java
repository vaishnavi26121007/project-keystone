
package com.zidio.keystone.service;

import com.zidio.keystone.dto.AuthResponse;
import com.zidio.keystone.dto.LoginRequest;
import com.zidio.keystone.dto.RegisterRequest;
import com.zidio.keystone.entity.*;
import com.zidio.keystone.repository.ClientRepository;
import com.zidio.keystone.repository.TechnicianRepository;
import com.zidio.keystone.repository.UserRepository;
import com.zidio.keystone.security.JwtService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final TechnicianRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException(
                    "Email already registered: " + request.getEmail()
            );
        }

        User.UserBuilder builder = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole());

        /*
         * CLIENT REGISTRATION
         *
         * Create a new Client organization and immediately
         * link the newly created User to it.
         */
        if (request.getRole() == Role.CLIENT) {

            if (request.getCompanyName() == null ||
                    request.getCompanyName().isBlank()) {

                throw new IllegalStateException(
                        "Company name is required for CLIENT accounts"
                );
            }

            Client client = Client.builder()
                    .companyName(request.getCompanyName().trim())
                    .contactEmail(request.getEmail())
                    .contactPhone(request.getPhone())
                    .build();

            client = clientRepository.save(client);

            builder.client(client);
        }

        User user = userRepository.save(builder.build());

        /*
         * TECHNICIAN REGISTRATION
         */
        if (request.getRole() == Role.TECHNICIAN) {

            Technician technician = Technician.builder()
                    .user(user)
                    .specialization(request.getSpecialization())
                    .build();

            technicianRepository.save(technician);
        }

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found")
                );

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        org.springframework.security.core.userdetails.UserDetails principal =
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword())
                        .authorities("ROLE_" + user.getRole().name())
                        .build();

        String token = jwtService.generateToken(principal, claims);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}

