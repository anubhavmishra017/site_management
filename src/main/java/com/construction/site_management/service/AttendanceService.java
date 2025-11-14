package com.construction.site_management.service;

import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.construction.site_management.model.Attendance;
import com.construction.site_management.model.Project;
import com.construction.site_management.model.Worker;
import com.construction.site_management.repository.AttendanceRepository;
import com.construction.site_management.repository.ProjectRepository;
import com.construction.site_management.repository.WorkerRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
            WorkerRepository workerRepository,
            ProjectRepository projectRepository) {
        this.attendanceRepository = attendanceRepository;
        this.workerRepository = workerRepository;
        this.projectRepository = projectRepository;
    }

    // Save single attendance
    public Attendance saveAttendance(Attendance attendance) {
        Long workerId = attendance.getWorker().getId();
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found with ID: " + workerId));
        attendance.setWorker(worker);

        if (attendance.getProject() != null && attendance.getProject().getId() != null) {
            Long projectId = attendance.getProject().getId();
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
            attendance.setProject(project);
        }

        // Prevent duplicates
        if (attendanceRepository.existsByWorkerAndDate(worker, attendance.getDate())) {
            throw new RuntimeException("Attendance already marked for this worker on " + attendance.getDate());
        }

        double totalPay = 0.0;
        if ("Present".equalsIgnoreCase(attendance.getStatus())) {
            totalPay = worker.getRatePerDay() + (attendance.getOvertimeHours() * (worker.getRatePerDay() / 8));
        }
        attendance.setTotalPay(totalPay);

        return attendanceRepository.save(attendance);
    }

    // Bulk save (only today)
    @Transactional
    public List<Attendance> saveAttendanceBulk(List<Attendance> attendanceList) {
        List<Attendance> saved = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Attendance att : attendanceList) {
            att.setDate(today); // force today
            if (!attendanceRepository.existsByWorkerAndDate(att.getWorker(), today)) {
                saved.add(saveAttendance(att));
            }
        }
        return saved;
    }

    // Update attendance
    public Attendance updateAttendance(Long id, Attendance attendance) {
        Attendance existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found with ID: " + id));

        if (attendance.getStatus() != null)
            existing.setStatus(attendance.getStatus());
        existing.setOvertimeHours(attendance.getOvertimeHours());

        // Recalculate total pay
        double totalPay = 0.0;
        if ("Present".equalsIgnoreCase(existing.getStatus())) {
            totalPay = existing.getWorker().getRatePerDay()
                    + (existing.getOvertimeHours() * (existing.getWorker().getRatePerDay() / 8));
        }
        existing.setTotalPay(totalPay);

        return attendanceRepository.save(existing);
    }

    // Fetch all attendance
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // Fetch by worker
    public List<Attendance> getAttendanceByWorker(Long workerId) {
        return attendanceRepository.findByWorkerId(workerId);
    }

    // Fetch by worker & date range
    public List<Attendance> getAttendanceByWorkerAndDateRange(Long workerId, LocalDate from, LocalDate to) {
        return attendanceRepository.findByWorkerIdAndDateBetween(workerId, from, to);
    }

    // Fetch by project
    public List<Attendance> getAttendanceByProject(Long projectId) {
        return attendanceRepository.findByProjectId(projectId);
    }

    // Fetch by project & date range
    public List<Attendance> getAttendanceByProjectAndDateRange(Long projectId, LocalDate from, LocalDate to) {
        return attendanceRepository.findByProjectIdAndDateBetween(projectId, from, to);
    }

    // Fetch by project & worker
    public List<Attendance> getAttendanceByProjectAndWorker(Long projectId, Long workerId) {
        return attendanceRepository.findByProjectIdAndWorkerId(projectId, workerId);
    }

    public void deleteAttendance(Long id) {
        attendanceRepository.deleteById(id);
    }

    @Transactional
    public void deleteAttendanceByWorker(Long workerId) {
        List<Attendance> records = attendanceRepository.findByWorkerId(workerId);
        attendanceRepository.deleteAll(records);
    }

}
