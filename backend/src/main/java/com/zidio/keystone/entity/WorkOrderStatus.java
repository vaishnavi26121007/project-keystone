package com.zidio.keystone.entity;

/**
 * Work Order Lifecycle:
 * NEW -> ASSIGNED -> IN_PROGRESS -> ON_HOLD (optional) -> IN_PROGRESS -> COMPLETED -> CLOSED
 * Any state before CLOSED can transition to CANCELLED.
 */
public enum WorkOrderStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    ON_HOLD,
    COMPLETED,
    CLOSED,
    CANCELLED
}
