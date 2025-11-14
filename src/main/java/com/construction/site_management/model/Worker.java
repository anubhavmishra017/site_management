package com.construction.site_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "worker")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private double ratePerDay;

    @JsonProperty("aadhaarNumber") // Ensures compatibility with frontend
    private String aadharNumber;

    private boolean policeVerified;
    private String address;
    private LocalDate joinedDate = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private String role;
}
