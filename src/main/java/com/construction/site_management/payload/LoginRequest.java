package com.construction.site_management.payload;

import lombok.Data;

@Data
public class LoginRequest {
    private String phone;
    private String password;
}
