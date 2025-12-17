package com.example.backend.service;

import com.example.backend.model.Payment;
import com.example.backend.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct; // Add this import

import java.util.List;

@Service
public class PaymentService {

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String keyId;

    @Value("${razorpay.key.secret:secret_placeholder}")
    private String keySecret;

    private RazorpayClient client;
    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @PostConstruct
    public void init() {
        try {
            if (keyId != null && !keyId.equals("rzp_test_placeholder")) {
                this.client = new RazorpayClient(keyId, keySecret);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Payment createOrder(Long bookingId, String userEmail, Double amount) throws Exception {
        if (client == null) {
            // Mock logic if no key provided
            Payment p = new Payment();
            p.setBookingId(bookingId);
            p.setUserEmail(userEmail);
            p.setAmount(amount);
            p.setRazorpayOrderId("order_mock_" + System.currentTimeMillis());
            p.setStatus("PENDING");
            return paymentRepository.save(p);
        }

        JSONObject options = new JSONObject();
        options.put("amount", (int) (amount * 100)); // paise
        options.put("currency", "INR");
        options.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = client.orders.create(options);

        Payment p = new Payment();
        p.setBookingId(bookingId);
        p.setUserEmail(userEmail);
        p.setAmount(amount);
        p.setRazorpayOrderId(order.get("id"));
        p.setStatus("PENDING");

        return paymentRepository.save(p);
    }

    public boolean verifyPayment(String orderId, String paymentId, String signature) throws Exception {
        if (client == null)
            return true; // Mock success

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);

        boolean isValid = Utils.verifyPaymentSignature(options, keySecret);

        if (isValid) {
            Payment p = paymentRepository.findByRazorpayOrderId(orderId);
            if (p != null) {
                p.setRazorpayPaymentId(paymentId);
                p.setStatus("PAID");
                paymentRepository.save(p);
            }
        }
        return isValid;
    }

    public List<Payment> getMyHistory(String email) {
        return paymentRepository.findByUserEmail(email);
    }

    public List<Payment> getDriverHistory(String email) {
        return paymentRepository.findByDriverEmail(email);
    }
}
