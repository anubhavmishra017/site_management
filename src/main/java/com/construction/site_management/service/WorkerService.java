package com.construction.site_management.service;

import com.construction.site_management.model.Worker;
import com.construction.site_management.model.Project;
import com.construction.site_management.repository.WorkerRepository;
import com.construction.site_management.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;

    public WorkerService(WorkerRepository workerRepository, ProjectRepository projectRepository) {
        this.workerRepository = workerRepository;
        this.projectRepository = projectRepository;
    }

    public Worker saveWorker(Worker worker) {
        if (worker.getProject() != null && worker.getProject().getId() != null) {
            Project project = projectRepository.findById(worker.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found with ID: " + worker.getProject().getId()));
            worker.setProject(project);
        }
        return workerRepository.save(worker);
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public Worker getWorkerById(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with ID: " + id));
    }

    public List<Worker> getWorkersByProjectId(Long projectId) {
        return workerRepository.findByProjectId(projectId);
    }
    public void deleteWorker(Long id) {
        if (!workerRepository.existsById(id)) {
            throw new RuntimeException("Cannot delete — Worker not found with ID: " + id);
        }
        workerRepository.deleteById(id);
    }
}
