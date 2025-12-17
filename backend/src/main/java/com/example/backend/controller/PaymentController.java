package com.example.backend.controller;

import com.example.backend.model.Payment;
import com.example.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            Long bookingId = Long.parseLong(data.get("bookingId").toString());
            Double amount = Double.parseDouble(data.get("amount").toString());
            String email = SecurityContextHolder.getContext().getAuthentication().getName();

            Payment p = paymentService.createOrder(bookingId, email, amount);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            String orderId = data.get("razorpayOrderId");
            String paymentId = data.get("razorpayPaymentId");
            String signature = data.get("razorpaySignature");

            boolean valid = paymentService.verifyPayment(orderId, paymentId, signature);
            if (valid)
                return ResponseEntity.ok("Payment Verified");
            else
                return ResponseEntity.badRequest().body("Invalid Signature");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-history")
    public ResponseEntity<?> getHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(paymentService.getMyHistory(email));
    }

    @GetMapping("/driver-history")
    public ResponseEntity<?> getDriverHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(paymentService.getDriverHistory(email));
    }
}
