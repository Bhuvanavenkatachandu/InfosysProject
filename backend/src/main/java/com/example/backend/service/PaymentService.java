package com.example.backend.service;

import com.example.backend.model.Payment;
import com.example.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public Payment logPaymentIntent(Long bookingId, String userEmail, Double amount, String stripePaymentIntentId) {
        Payment p = new Payment();
        p.setBookingId(bookingId);
        p.setUserEmail(userEmail);
        p.setAmount(amount);
        p.setStripePaymentIntentId(stripePaymentIntentId);
        p.setStatus("PENDING");
        return paymentRepository.save(p);
    }

    public Payment confirmPayment(String stripePaymentIntentId, String stripePaymentMethodId) {
        Payment p = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId);
        if (p != null) {
            p.setStripePaymentMethodId(stripePaymentMethodId);
            p.setStatus("CONFIRMED");
            return paymentRepository.save(p);
        }
        return null;
    }

    public List<Payment> getMyHistory(String email) {
        return paymentRepository.findByUserEmail(email);
    }

    public List<Payment> getDriverHistory(String email) {
        return paymentRepository.findByDriverEmail(email);
    }
}
