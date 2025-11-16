package com.construction.site_management.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.construction.site_management.model.Worker;
import com.construction.site_management.service.WorkerService;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {
    
    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PostMapping
    public Worker addWorker(@RequestBody Worker worker) {
        return workerService.saveWorker(worker);
    }

    @GetMapping
    public List<Worker> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    @GetMapping("/{id}")
    public Worker getWorkerById(@PathVariable Long id) {
        return workerService.getWorkerById(id);
    }

    @GetMapping("/project/{projectId}")
    public List<Worker> getWorkersByProjectId(@PathVariable Long projectId) {
        return workerService.getWorkersByProjectId(projectId);
    }

    @PutMapping("/{id}")
    public Worker updateWorker(@PathVariable Long id, @RequestBody Worker updatedWorker) {
        Worker existingWorker = workerService.getWorkerById(id);
        if (existingWorker != null) {
            existingWorker.setName(updatedWorker.getName());
            existingWorker.setPhone(updatedWorker.getPhone());
            existingWorker.setRatePerDay(updatedWorker.getRatePerDay());
            existingWorker.setPoliceVerified(updatedWorker.isPoliceVerified());
            existingWorker.setAddress(updatedWorker.getAddress());
            existingWorker.setJoinedDate(updatedWorker.getJoinedDate());
            existingWorker.setAadharNumber(updatedWorker.getAadharNumber());
            existingWorker.setRole(updatedWorker.getRole()); // ✅ Add this line
            return workerService.saveWorker(existingWorker);
        } else {
            return null;
        }
    }


    @DeleteMapping("/{id}")
    public void deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
    }
}
