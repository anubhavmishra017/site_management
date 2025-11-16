package com.construction.site_management.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.construction.site_management.model.Payment;
import com.construction.site_management.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // ADMIN adds a payment
    @PostMapping("/add")
    public ResponseEntity<Payment> addPayment(@RequestBody Map<String, Object> req) {
        Long workerId = Long.valueOf(req.get("workerId").toString());
        String type = req.get("type").toString();
        Double amount = Double.valueOf(req.get("amount").toString());
        String note = req.get("note") != null ? req.get("note").toString() : "";

        return ResponseEntity.ok(paymentService.addPayment(workerId, type, amount, note));
    }

    // WORKER sees his payment history
    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Payment>> getPaymentsByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(paymentService.getPaymentsByWorker(workerId));
    }
}
