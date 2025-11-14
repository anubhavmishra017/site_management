package com.construction.site_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.construction.site_management.model.Material;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
    List<Material> findByProjectId(Long projectId);
    List<Material> findByNameContainingIgnoreCase(String name);
    List<Material> findBySupplierNameIgnoreCase(String supplierName);
}
