package com.construction.site_management.controller;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.construction.site_management.model.Attendance;
import com.construction.site_management.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // MARK SINGLE ATTENDANCE
    @PostMapping
    public ResponseEntity<?> markAttendance(@RequestBody Attendance attendance) {
        try {
            Attendance saved = attendanceService.saveAttendance(attendance);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // MARK BULK ATTENDANCE
    @PostMapping("/bulk")
    public ResponseEntity<?> markAttendanceBulk(@RequestBody List<Attendance> attendanceList) {
        try {
            List<Attendance> saved = attendanceService.saveAttendanceBulk(attendanceList);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // UPDATE ATTENDANCE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAttendance(@PathVariable Long id, @RequestBody Attendance attendance) {
        try {
            Attendance updated = attendanceService.updateAttendance(id, attendance);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET ALL ATTENDANCE (with optional date range)
    @GetMapping
    public ResponseEntity<List<Attendance>> getAllAttendance(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        try {
            List<Attendance> list;
            if (from != null && to != null) {
                LocalDate f = LocalDate.parse(from);
                LocalDate t = LocalDate.parse(to);
                list = attendanceService.getAllAttendance()
                        .stream()
                        .filter(a -> !a.getDate().isBefore(f) && !a.getDate().isAfter(t))
                        .toList();
            } else {
                list = attendanceService.getAllAttendance();
            }
            if (list.isEmpty())
                return ResponseEntity.noContent().build();
            return ResponseEntity.ok(list);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET ATTENDANCE BY WORKER (with optional date range)
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Attendance>> getAttendanceByWorker(@PathVariable Long workerId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        try {
            List<Attendance> list;
            if (from != null && to != null) {
                LocalDate f = LocalDate.parse(from);
                LocalDate t = LocalDate.parse(to);
                list = attendanceService.getAttendanceByWorkerAndDateRange(workerId, f, t);
            } else {
                list = attendanceService.getAttendanceByWorker(workerId);
            }
            if (list.isEmpty())
                return ResponseEntity.noContent().build();
            return ResponseEntity.ok(list);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET ATTENDANCE BY PROJECT (with optional date range)
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Attendance>> getAttendanceByProject(@PathVariable Long projectId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        try {
            List<Attendance> list;
            if (from != null && to != null) {
                LocalDate f = LocalDate.parse(from);
                LocalDate t = LocalDate.parse(to);
                list = attendanceService.getAttendanceByProjectAndDateRange(projectId, f, t);
            } else {
                list = attendanceService.getAttendanceByProject(projectId);
            }
            if (list.isEmpty())
                return ResponseEntity.noContent().build();
            return ResponseEntity.ok(list);
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE ATTENDANCE BY WORKER
    @DeleteMapping("/worker/{workerId}")
    public ResponseEntity<String> deleteAttendanceByWorker(@PathVariable Long workerId) {
        attendanceService.deleteAttendanceByWorker(workerId);
        return ResponseEntity.ok("All attendance records deleted for worker ID: " + workerId);
    }
}
