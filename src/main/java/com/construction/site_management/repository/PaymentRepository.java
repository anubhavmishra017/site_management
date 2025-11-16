package com.construction.site_management.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.construction.site_management.model.Payment;
import com.construction.site_management.model.Worker;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByWorker(Worker worker);
}
