package com.construction.site_management.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "materials")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;    
    private double quantity;
    private String unit;
    private double costPerUnit;
    private String supplierName;

    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}
