package com.construction.site_management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.construction.site_management.model.Project;
import com.construction.site_management.model.Task;
import com.construction.site_management.model.Worker;
import com.construction.site_management.repository.ProjectRepository;
import com.construction.site_management.repository.TaskRepository;
import com.construction.site_management.repository.WorkerRepository;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkerRepository workerRepository;

    public Task createTask(Task task, Long projectId, Long workerId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found with ID: "+projectId));

        Worker worker = workerRepository.findById(workerId).orElseThrow(() -> new RuntimeException("Worker not found with ID: "+workerId));
        
        task.setProject(project);
        task.setWorker(worker);

        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));
    }

    public List<Task> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found with ID: "+projectId));

        return taskRepository.findByProject(project);
    }

    public List<Task> getTasksByWorker(Long workerId) {
        Worker worker = workerRepository.findById(workerId).orElseThrow(() -> new RuntimeException("Worker not found with ID: "+workerId));

        return taskRepository.findByWorker(worker);
    }

    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + id));

        existingTask.setTaskName(updatedTask.getTaskName());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setStartDate(updatedTask.getStartDate());
        existingTask.setEndDate(updatedTask.getEndDate());
        existingTask.setDescription(updatedTask.getDescription());

        return taskRepository.save(existingTask);
    }

    public String deleteTask(Long id){
        Task existingTask = taskRepository.findById(id).orElseThrow(()-> new RuntimeException("Task not found with ID: "+id));
        taskRepository.delete(existingTask);
        return "Task deleted successfully with ID: "+id;
    }
}
