package com.zidio.keystone.service;

import com.zidio.keystone.dto.TechnicianResponse;
import com.zidio.keystone.entity.Technician;
import com.zidio.keystone.repository.TechnicianRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TechnicianRepository technicianRepository;

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAll() {
        return technicianRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAvailable() {
        return technicianRepository
                .findByAvailability(Technician.AvailabilityStatus.AVAILABLE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TechnicianResponse getByUserId(Long userId) {
        Technician technician = technicianRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Technician profile not found"));

        return toResponse(technician);
    }

    @Transactional
    public TechnicianResponse updateAvailability(
            Long id,
            Technician.AvailabilityStatus status) {

        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Technician not found"));

        technician.setAvailability(status);

        return toResponse(technicianRepository.save(technician));
    }

    private TechnicianResponse toResponse(Technician technician) {

        return TechnicianResponse.builder()
                .id(technician.getId())
                .userId(technician.getUser().getId())
                .fullName(technician.getUser().getFullName())
                .email(technician.getUser().getEmail())
                .phone(technician.getUser().getPhone())
                .specialization(technician.getSpecialization())
                .availability(technician.getAvailability())
                .skillTags(technician.getSkillTags())
                .build();
    }
}