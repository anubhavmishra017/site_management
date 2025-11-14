package com.construction.site_management.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.construction.site_management.model.Material;
import com.construction.site_management.repository.MaterialRepository;

@Service
@Transactional
public class MaterialService {

    private final MaterialRepository materialRepository;

    public MaterialService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    public Material saveMaterial(Material material) {
        return materialRepository.save(material);
    }

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material not found with ID: " + id));
    }

    public List<Material> getMaterialsByProjectId(Long projectId) {
        return materialRepository.findByProjectId(projectId);
    }

    public void deleteMaterial(Long id) {
        if (!materialRepository.existsById(id)) {
            throw new IllegalArgumentException("Cannot delete — Material not found with ID: " + id);
        }
        materialRepository.deleteById(id);
    }
}
