package com.construction.site_management.service;

import java.time.LocalDate;
import java.util.*;

import org.springframework.stereotype.Service;

import com.construction.site_management.model.Attendance;
import com.construction.site_management.model.Payment;
import com.construction.site_management.model.Worker;

import com.construction.site_management.repository.AttendanceRepository;
import com.construction.site_management.repository.PaymentRepository;
import com.construction.site_management.repository.WorkerRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final WorkerRepository workerRepository;
    private final AttendanceRepository attendanceRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            WorkerRepository workerRepository,
            AttendanceRepository attendanceRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.workerRepository = workerRepository;
        this.attendanceRepository = attendanceRepository;
    }

    // ================== ADD PAYMENT ==================
    public Payment addPayment(Long workerId, String type, Double amount, String note) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        Payment p = new Payment();
        p.setWorker(worker);
        p.setType(type);
        p.setAmount(amount);
        p.setDate(LocalDate.now());
        p.setNote(note);

        return paymentRepository.save(p);
    }

    // ================== GET ALL ==================
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // ================== AUTO SALARY ==================
    public Payment generateMonthlySalary(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        List<Attendance> records = attendanceRepository.findByWorkerId(worker.getId());

        int presentDays = (int) records.stream()
                .filter(a -> "Present".equalsIgnoreCase(a.getStatus()))
                .count();

        double salaryAmount = presentDays * worker.getRatePerDay();

        Payment p = new Payment();
        p.setWorker(worker);
        p.setType("Salary");
        p.setAmount(salaryAmount);
        p.setDate(LocalDate.now());
        p.setNote("Auto-generated based on attendance");

        return paymentRepository.save(p);
    }

    public void generateSalaryForAllWorkers() {
        workerRepository.findAll().forEach(w -> generateMonthlySalary(w.getId()));
    }

    // ================== DELETE PAYMENT ==================
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Payment not found");
        }
        paymentRepository.deleteById(id);
    }

    public List<Payment> getPaymentsByWorker(Long workerId) {
        return paymentRepository.findByWorkerId(workerId);
    }

    // ================== FINANCE SUMMARY ==================
    public Map<String, Object> getFinanceSummary() {

        Map<String, Object> summary = new HashMap<>();

        // Total Salary & Advance
        Double totalSalary = paymentRepository.totalSalaryPaid();
        Double totalAdvance = paymentRepository.totalAdvanceGiven();

        summary.put("totalSalary", totalSalary);
        summary.put("totalAdvance", totalAdvance);
        summary.put("balance", totalSalary - totalAdvance);

        // Last 6 months
        LocalDate start = LocalDate.now().minusMonths(6);

        summary.put("salaryMonthly", paymentRepository.monthlySalary(start));
        summary.put("advanceMonthly", paymentRepository.monthlyAdvance(start));

        // Top Paid Workers
        summary.put("topPaidWorkers", paymentRepository.topPaidWorkers());

        return summary;
    }
}
