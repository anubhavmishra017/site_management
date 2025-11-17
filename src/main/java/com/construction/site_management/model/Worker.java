package com.construction.site_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

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

    // AUTH FIELDS (new)
    @Column(length = 255)
    private String password; // bcrypt-hashed

    @Column(name = "must_reset_password")
    private Boolean mustResetPassword = true; // defaults true

    @JsonProperty("aadhaarNumber") // Ensures compatibility with frontend
    private String aadharNumber;

    private boolean policeVerified;
    private String address;
    private LocalDate joinedDate = LocalDate.now();

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private String role;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
@com.fasterxml.jackson.annotation.JsonIgnore
private List<Attendance> attendanceList;

@OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
@com.fasterxml.jackson.annotation.JsonIgnore
private List<Payment> payments;

@OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
@com.fasterxml.jackson.annotation.JsonIgnore
private List<Task> tasks;

}
