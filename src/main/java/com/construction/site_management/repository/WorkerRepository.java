package com.construction.site_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.construction.site_management.model.Worker;

public interface WorkerRepository extends JpaRepository<Worker, Long> {
     List<Worker> findByProjectId(Long projectId);
     Optional<Worker> findByPhone(String phone);
}
