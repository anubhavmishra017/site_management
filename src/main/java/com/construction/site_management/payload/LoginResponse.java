package com.construction.site_management.payload;

import lombok.Data;
import com.construction.site_management.model.Worker;

@Data
public class LoginResponse {
    private Worker worker;
    private boolean mustResetPassword;
}