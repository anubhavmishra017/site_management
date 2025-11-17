package com.construction.site_management.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.construction.site_management.model.Attendance;
import com.construction.site_management.model.Worker;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByWorkerAndDate(Worker worker, LocalDate date);

    List<Attendance> findByWorkerId(Long workerId);

    void deleteByWorkerId(Long workerId);
    

    List<Attendance> findByProjectId(Long projectId);

    List<Attendance> findByProjectIdAndWorkerId(Long projectId, Long workerId);

    List<Attendance> findByProjectIdAndDateBetween(Long projectId, LocalDate start, LocalDate end);

    List<Attendance> findByWorkerIdAndDateBetween(Long workerId, LocalDate start, LocalDate end);

    @Query("SELECT SUM(a.overtimeHours) FROM Attendance a")
    Double sumOvertimeHours();

    @Query("SELECT COUNT(a.id) * 1.0 / COUNT(DISTINCT a.date) FROM Attendance a")
    Double findAverageAttendancePerDay();

    // <-- NEW: weekly attendance between dates
    @Query("SELECT FUNCTION('DAYNAME', a.date) AS day, COUNT(a.id) * 1.0 / (SELECT COUNT(DISTINCT a2.date) FROM Attendance a2 WHERE a2.date BETWEEN :start AND :end) AS avgAttendance " +
           "FROM Attendance a " +
           "WHERE a.date BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DAYNAME', a.date)")
    List<Object[]> findAttendanceBetweenDates(LocalDate start, LocalDate end);
}
