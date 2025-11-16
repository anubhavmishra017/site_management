package com.construction.site_management.payload;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private Long workerId;
    private String newPassword;
}
