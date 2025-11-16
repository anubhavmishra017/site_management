package com.construction.site_management.service;

import java.util.List;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.construction.site_management.model.Payment;
import com.construction.site_management.model.Worker;
import com.construction.site_management.repository.PaymentRepository;
import com.construction.site_management.repository.WorkerRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final WorkerRepository workerRepository;

    public PaymentService(PaymentRepository paymentRepository, WorkerRepository workerRepository) {
        this.paymentRepository = paymentRepository;
        this.workerRepository = workerRepository;
    }

    public Payment addPayment(Long workerId, String type, Double amount, String note) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        Payment p = new Payment();
        p.setWorker(worker);
        p.setType(type);
        p.setAmount(amount);
        p.setDate(LocalDate.now());
        p.setNote(note);

        return paymentRepository.save(p);
    }

    public List<Payment> getPaymentsByWorker(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        return paymentRepository.findByWorker(worker);
    }
}
