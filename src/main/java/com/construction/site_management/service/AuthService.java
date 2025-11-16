package com.construction.site_management.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Service;

import com.construction.site_management.model.Worker;
import com.construction.site_management.repository.WorkerRepository;
import com.construction.site_management.payload.LoginResponse;

@Service
public class AuthService {

    private final WorkerRepository workerRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    public LoginResponse login(String phone, String rawPassword) {
        Worker worker = workerRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // if password field is null or blank, treat as default = phone (first time)
        boolean matches;
        if (worker.getPassword() == null || worker.getPassword().isEmpty()) {
            matches = rawPassword.equals(worker.getPhone());
        } else {
            matches = passwordEncoder.matches(rawPassword, worker.getPassword());
        }

        if (!matches) throw new RuntimeException("Invalid credentials");

        // Build response: return worker object but hide password
        Worker safe = new Worker();
        safe.setId(worker.getId());
        safe.setName(worker.getName());
        safe.setPhone(worker.getPhone());
        safe.setAddress(worker.getAddress());
        safe.setRatePerDay(worker.getRatePerDay());
        safe.setPoliceVerified(worker.isPoliceVerified());
        safe.setRole(worker.getRole());
        safe.setAadharNumber(worker.getAadharNumber());
        // do not include password in returned object

        LoginResponse resp = new LoginResponse();
        resp.setWorker(safe);
        resp.setMustResetPassword(Boolean.TRUE.equals(worker.getMustResetPassword()));

        return resp;
    }

    public void changePassword(Long workerId, String newPassword) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        String hashed = passwordEncoder.encode(newPassword);
        worker.setPassword(hashed);
        worker.setMustResetPassword(false);
        workerRepository.save(worker);
    }

    public void adminResetPassword(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        // Reset to phone (clear password then set mustReset)
        worker.setPassword(passwordEncoder.encode(worker.getPhone()));
        worker.setMustResetPassword(true);
        workerRepository.save(worker);
    }
}
