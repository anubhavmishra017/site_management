package com.construction.site_management.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.construction.site_management.model.Admin;
import com.construction.site_management.repository.AdminRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        String phone = req.get("phone");
        String password = req.get("password");

        Admin admin = adminRepository.findByPhone(phone);

        if (admin == null || !admin.getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        return ResponseEntity.ok("LOGIN_SUCCESS");
    }
}

