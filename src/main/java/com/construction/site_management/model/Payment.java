package com.construction.site_management.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Worker for whom payment was made
    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    // Salary or Advance or Other
    @Column(nullable = false)
    private String type; // "Salary" or "Advance"

    @Column(nullable = false)
    private Double amount;

    private LocalDate date;

    private String note;
}
