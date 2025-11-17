package com.construction.site_management.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.construction.site_management.repository.AttendanceRepository;
import com.construction.site_management.repository.PaymentRepository;
import com.construction.site_management.repository.ProjectRepository;
import com.construction.site_management.repository.WorkerRepository;

@Service
public class DashboardService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> summary = new HashMap<>();

        // ====================================================
        // BASIC COUNTS
        // ====================================================
        long totalWorkers = workerRepository.count();
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus("Active");
        long completedProjects = projectRepository.countByStatus("Completed");
        long pendingProjects = projectRepository.countByStatus("Pending");
        long totalAttendanceRecords = attendanceRepository.count();

        Double totalOvertimeHours = attendanceRepository.sumOvertimeHours();
        if (totalOvertimeHours == null) totalOvertimeHours = 0.0;

        Double avgAttendance = attendanceRepository.findAverageAttendancePerDay();
        if (avgAttendance == null) avgAttendance = 0.0;

        summary.put("totalWorkers", totalWorkers);
        summary.put("totalProjects", totalProjects);
        summary.put("activeProjects", activeProjects);
        summary.put("completedProjects", completedProjects);
        summary.put("pendingProjects", pendingProjects);
        summary.put("totalAttendanceRecords", totalAttendanceRecords);
        summary.put("totalOvertimeHours", totalOvertimeHours);
        summary.put("averageDailyAttendance", avgAttendance);

        // ====================================================
        // WEEKLY ATTENDANCE SUMMARY (for chart)
        // ====================================================
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);

        List<Object[]> raw = attendanceRepository.findAttendanceBetweenDates(start, end);

        Map<DayOfWeek, Double> map = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            map.put(start.plusDays(i).getDayOfWeek(), 0.0);
        }

        for (Object[] row : raw) {
            String dayName = (String) row[0];
            Double val = (Double) row[1];
            map.put(DayOfWeek.valueOf(dayName.toUpperCase()), val);
        }

        List<Map<String, Object>> weekly = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = start.plusDays(i);
            Map<String, Object> entry = new HashMap<>();
            entry.put("day", d.getDayOfWeek().name().substring(0, 3)); // Mon, Tue...
            entry.put("attendance", map.get(d.getDayOfWeek()));
            weekly.add(entry);
        }

        summary.put("weeklyAttendance", weekly);

        // ====================================================
        // ⭐ FINANCE SUMMARY (used in updated Dashboard)
        // ====================================================

        Double totalSalary = paymentRepository.findAll().stream()
                .filter(p -> "Salary".equalsIgnoreCase(p.getType()))
                .mapToDouble(p -> p.getAmount())
                .sum();

        Double totalAdvance = paymentRepository.findAll().stream()
                .filter(p -> "Advance".equalsIgnoreCase(p.getType()))
                .mapToDouble(p -> p.getAmount())
                .sum();

        summary.put("totalSalary", totalSalary);
        summary.put("totalAdvance", totalAdvance);
        summary.put("balance", totalSalary - totalAdvance);

        // -----------------------------
        // Last 6 months salary/advance
        // -----------------------------
        List<Object[]> salaryMonthly = new ArrayList<>();
        List<Object[]> advanceMonthly = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            int month = today.minusMonths(i).getMonthValue();

            double sal = paymentRepository.findAll().stream()
                    .filter(p -> "Salary".equalsIgnoreCase(p.getType()))
                    .filter(p -> p.getDate() != null && p.getDate().getMonthValue() == month)
                    .mapToDouble(p -> p.getAmount()).sum();

            double adv = paymentRepository.findAll().stream()
                    .filter(p -> "Advance".equalsIgnoreCase(p.getType()))
                    .filter(p -> p.getDate() != null && p.getDate().getMonthValue() == month)
                    .mapToDouble(p -> p.getAmount()).sum();

            salaryMonthly.add(new Object[]{month, sal});
            advanceMonthly.add(new Object[]{month, adv});
        }

        summary.put("salaryMonthly", salaryMonthly);
        summary.put("advanceMonthly", advanceMonthly);

        // -----------------------------
        // TOP PAID WORKERS
        // -----------------------------
        Map<Long, Double> salaryMap = new HashMap<>();

        paymentRepository.findAll().forEach(p -> {
            if ("Salary".equalsIgnoreCase(p.getType())) {
                salaryMap.put(
                        p.getWorker().getId(),
                        salaryMap.getOrDefault(p.getWorker().getId(), 0.0) + p.getAmount()
                );
            }
        });

        List<Object[]> topWorkers = new ArrayList<>();

        salaryMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(5)
                .forEach(e -> {
                    topWorkers.add(new Object[]{
                            e.getKey(),
                            workerRepository.findById(e.getKey()).get().getName(),
                            e.getValue()
                    });
                });

        summary.put("topPaidWorkers", topWorkers);

        return summary;
    }
}
