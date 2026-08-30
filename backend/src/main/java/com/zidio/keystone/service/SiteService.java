package com.zidio.keystone.service;

import com.zidio.keystone.dto.SiteRequest;
import com.zidio.keystone.entity.Client;
import com.zidio.keystone.entity.Role;
import com.zidio.keystone.entity.Site;
import com.zidio.keystone.entity.User;
import com.zidio.keystone.repository.ClientRepository;
import com.zidio.keystone.repository.SiteRepository;
import com.zidio.keystone.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteService {

    private final SiteRepository siteRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    @Transactional
    public Site create(SiteRequest request, String requesterEmail) {

        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Client client;

        if (user.getRole() == Role.CLIENT) {

            if (user.getClient() == null) {
                throw new IllegalStateException(
                        "Your account is not linked to a client organization"
                );
            }

            // CLIENT can only create sites for their own organization
            client = user.getClient();

        } else {

            if (request.getClientId() == null) {
                throw new IllegalStateException(
                        "clientId is required"
                );
            }

            client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() ->
                            new EntityNotFoundException("Client not found")
                    );
        }

        Site site = Site.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .client(client)
                .build();

        return siteRepository.save(site);
    }

    @Transactional(readOnly = true)
    public List<Site> getAllForUser(String requesterEmail) {

        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getRole() == Role.CLIENT) {

            if (user.getClient() == null) {
                return List.of();
            }

            return siteRepository.findByClientId(
                    user.getClient().getId()
            );
        }

        return siteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Site> getByClientForUser(
            Long clientId,
            String requesterEmail
    ) {

        User user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (user.getRole() == Role.CLIENT) {

            if (user.getClient() == null ||
                    !user.getClient().getId().equals(clientId)) {

                throw new IllegalStateException(
                        "You do not have access to this client's sites"
                );
            }
        }

        return siteRepository.findByClientId(clientId);
    }

    public void delete(Long id) {
        if (!siteRepository.existsById(id)) {
            throw new EntityNotFoundException("Site not found");
        }

        siteRepository.deleteById(id);
    }
}