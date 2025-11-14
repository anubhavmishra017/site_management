package com.construction.site_management.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.construction.site_management.repository.AttendanceRepository;
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

    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        long totalWorkers = workerRepository.count();
        long totalProjects = projectRepository.count();
        long totalAttendanceRecords = attendanceRepository.count();

        Double totalOvertimeHours = attendanceRepository.sumOvertimeHours();
        if (totalOvertimeHours == null) totalOvertimeHours = 0.0;

        long activeProjects = projectRepository.countByStatus("Active");

        // Currently assuming you also have completed/pending projects
        long completedProjects = projectRepository.countByStatus("Completed");
        long pendingProjects = projectRepository.countByStatus("Pending");

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

        // Weekly attendance for chart
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(6); // last 7 days

        List<Object[]> weeklyRaw = attendanceRepository.findAttendanceBetweenDates(startDate, endDate);

        // Format for frontend chart
        List<Map<String, Object>> weeklyAttendance = new ArrayList<>();

        // Initialize map with all days to ensure no missing day in chart
        Map<DayOfWeek, Double> dayMap = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            dayMap.put(startDate.plusDays(i).getDayOfWeek(), 0.0);
        }

        // Fill values from query
        for (Object[] record : weeklyRaw) {
            String dayName = (String) record[0];       // e.g., "Monday"
            Double value = (Double) record[1];         // average attendance
            DayOfWeek day = DayOfWeek.valueOf(dayName.toUpperCase());
            dayMap.put(day, value);
        }

        // Convert map to list with proper order
        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", date.getDayOfWeek().name().substring(0,3)); // Mon, Tue, ...
            dayData.put("attendance", dayMap.get(date.getDayOfWeek()));
            weeklyAttendance.add(dayData);
        }

        summary.put("weeklyAttendance", weeklyAttendance);

        return summary;
    }
}
