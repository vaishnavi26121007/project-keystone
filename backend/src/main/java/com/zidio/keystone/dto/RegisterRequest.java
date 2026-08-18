package com.zidio.keystone.dto;

import com.zidio.keystone.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;

    @NotNull
    private Role role;

    // Required only when role == CLIENT (link to existing client org) - optional otherwise
    private Long clientId;

    // Required only when role == TECHNICIAN
    private String specialization;
}
