package com.construction.site_management.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.construction.site_management.model.Project;
import com.construction.site_management.model.Task;
import com.construction.site_management.model.Worker;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByProject(Project project);
    List<Task> findByWorker(Worker worker);
    List<Task> findByStatus(String status);
}
