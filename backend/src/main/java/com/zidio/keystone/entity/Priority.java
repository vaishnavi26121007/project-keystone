package com.zidio.keystone.entity;

public enum Priority {
    LOW(72),
    MEDIUM(24),
    HIGH(8),
    CRITICAL(2);

    // Default SLA response window in hours for this priority
    private final int slaHours;

    Priority(int slaHours) {
        this.slaHours = slaHours;
    }

    public int getSlaHours() {
        return slaHours;
    }
}
