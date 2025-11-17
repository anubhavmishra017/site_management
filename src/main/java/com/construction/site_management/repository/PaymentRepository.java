package com.construction.site_management.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.construction.site_management.model.Payment;
import com.construction.site_management.model.Worker;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByWorkerId(Long workerId);
    List<Payment> findByWorker(Worker worker);

    // ================= FINANCE SUMMARY =================

    // Total Salary Paid
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.type = 'Salary'")
    Double totalSalaryPaid();

    // Total Advance Given
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.type = 'Advance'")
    Double totalAdvanceGiven();

    // Monthly Salary (last 6 months)
    @Query("SELECT FUNCTION('MONTH', p.date), COALESCE(SUM(p.amount), 0) " +
           "FROM Payment p WHERE p.type='Salary' AND p.date >= :start " +
           "GROUP BY FUNCTION('MONTH', p.date)")
    List<Object[]> monthlySalary(LocalDate start);

    // Monthly Advance (last 6 months)
    @Query("SELECT FUNCTION('MONTH', p.date), COALESCE(SUM(p.amount), 0) " +
           "FROM Payment p WHERE p.type='Advance' AND p.date >= :start " +
           "GROUP BY FUNCTION('MONTH', p.date)")
    List<Object[]> monthlyAdvance(LocalDate start);

    // Top 5 highest paid workers
    @Query("""
           SELECT p.worker.id, p.worker.name, SUM(p.amount)
           FROM Payment p
           WHERE p.type='Salary'
           GROUP BY p.worker.id, p.worker.name
           ORDER BY SUM(p.amount) DESC
           """)
    List<Object[]> topPaidWorkers();
}
