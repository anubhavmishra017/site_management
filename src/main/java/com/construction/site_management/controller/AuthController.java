package com.construction.site_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.construction.site_management.service.AuthService;
import com.construction.site_management.payload.LoginRequest;
import com.construction.site_management.payload.ChangePasswordRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // worker login
    @PostMapping("/worker/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req.getPhone(), req.getPassword()));
    }

    // worker change password (after first login or later)
    @PostMapping("/worker/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest req) {
        authService.changePassword(req.getWorkerId(), req.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    // Admin resets a worker's password back to their phone (force reset)
    @PostMapping("/admin/reset-password/{workerId}")
    public ResponseEntity<?> adminResetPassword(@PathVariable Long workerId) {
        authService.adminResetPassword(workerId);
        return ResponseEntity.ok("Reset OK");
    }
}
