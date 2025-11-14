package com.construction.site_management.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.construction.site_management.model.Project;
import com.construction.site_management.model.Task;
import com.construction.site_management.model.Worker;
import com.construction.site_management.repository.ProjectRepository;
import com.construction.site_management.repository.TaskRepository;
import com.construction.site_management.repository.WorkerRepository;

@Service
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final WorkerRepository workerRepository;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       WorkerRepository workerRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.workerRepository = workerRepository;
    }

    // CREATE TASK
    public Task createTask(Task task) {

        // Load worker
        Worker worker = workerRepository.findById(task.getWorker().getId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        task.setWorker(worker);

        // Load project
        Project project = projectRepository.findById(task.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        task.setProject(project);

        // Deadline: optional, but supported
        if (task.getDeadline() == null) {
            task.setDeadline(LocalDate.now().plusDays(3)); // default (optional)
        }

        return taskRepository.save(task);
    }

    // GET ALL TASKS
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // GET ONE TASK
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));
    }

    // UPDATE TASK
    public Task updateTask(Long id, Task updatedTask) {
        Task task = getTaskById(id);

        task.setTaskName(updatedTask.getTaskName());
        task.setDescription(updatedTask.getDescription());
        task.setStatus(updatedTask.getStatus());
        task.setDeadline(updatedTask.getDeadline());

        // Update worker
        Worker worker = workerRepository.findById(updatedTask.getWorker().getId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        task.setWorker(worker);

        // Update project
        Project project = projectRepository.findById(updatedTask.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        task.setProject(project);

        return taskRepository.save(task);
    }

    public String deleteTask(Long id){
        Task task = getTaskById(id);
        taskRepository.delete(task);
        return "Task deleted successfully with ID: " + id;
    }
}
