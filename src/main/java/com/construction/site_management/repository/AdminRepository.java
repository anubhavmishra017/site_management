package com.construction.site_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.construction.site_management.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Admin findByPhone(String phone);
}

