import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/jwt";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe("pk_test_51SgeU8BVju1ZUEzBUORvqrJUj9NEZH87rT3x3uYnEHJrIEoqotLCUATlgptj6N42ZVhkT6IN3ndg5k76tLFJFrca00o9L6CLGi");

function CheckoutForm({ amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { bookingId } = useLocation().state || {};

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin,
            },
            redirect: "if_required"
        });

        if (error) {
            console.error("Stripe confirmPayment error:", error);
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
                alert("Payment Failed: " + error.message);
            } else {
                setMessage("An unexpected error occurred.");
                alert("Payment Failed: An unexpected error occurred.");
            }
        } else {
            if (paymentIntent && paymentIntent.status === "succeeded") {
                console.log("PaymentIntent succeeded:", paymentIntent);
                if (bookingId) {
                    try {
                        // 1. Update Booking Status
                        await apiFetch(`/api/bookings/${bookingId}/status`, {
                            method: "PUT",
                            body: JSON.stringify({ status: "CONFIRMED" })
                        });
                        // 2. Update Payment Record
                        await apiFetch(`/api/payment/confirm`, {
                            method: "POST",
                            body: JSON.stringify({
                                paymentIntentId: paymentIntent.id,
                                paymentMethodId: paymentIntent.payment_method
                            })
                        });
                    } catch (e) { console.error("Status update failed:", e); }
                }
                setMessage("Payment Successful! Redirecting...");
                setTimeout(() => {
                    navigate("/my-bookings");
                }, 2000);
            } else {
                setMessage("Payment processing...");
            }
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "40px auto", padding: "30px", boxShadow: "0 0 20px rgba(0,0,0,0.1)", borderRadius: "10px", backgroundColor: "white" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Pay ₹{amount}</h2>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" style={{ marginTop: "20px", width: "100%", padding: "14px", backgroundColor: "#5469d4", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", opacity: isLoading ? 0.7 : 1 }}>
                <span id="button-text">
                    {isLoading ? "Processing..." : `Pay ₹${amount}`}
                </span>
            </button>
            {message && <div id="payment-message" style={{ marginTop: "15px", textAlign: "center", color: message.includes("Failed") ? "red" : "green", fontWeight: "bold" }}>{message}</div>}
        </form>
    );
}

export default function PaymentPage() {
    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState(null);
    const location = useLocation();
    // Get amount from navigation state or default to 100
    const amount = location.state?.amount || 100;
    const bookingId = location.state?.bookingId;

    useEffect(() => {
        console.log("PaymentPage: Fetching payment intent for amount:", amount, "bookingId:", bookingId);
        apiFetch("/api/payment/create-payment-intent", {
            method: "POST",
            body: JSON.stringify({ amount: amount, bookingId: bookingId }),
        })
            .then((data) => {
                console.log("PaymentPage: Received clientSecret:", data.clientSecret ? "Yes" : "No");
                setClientSecret(data.clientSecret);
            })
            .catch(err => {
                console.error("PaymentPage: Error fetching payment intent:", err);
                setError(err.message || "Failed to initialize payment.");
            });
    }, [amount, bookingId]);

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="PaymentPage" style={{ fontFamily: "var(--font-family, sans-serif)", minHeight: "100vh", backgroundColor: "#f7f9fc", paddingTop: "50px" }}>
            <h1 style={{ textAlign: "center", color: "#333" }}>Complete Your Payment</h1>
            {error && (
                <div style={{ textAlign: "center", color: "red", marginTop: "20px", padding: "20px", border: "1px solid red", borderRadius: "8px", maxWidth: "500px", margin: "20px auto" }}>
                    <h3>Payment Initialization Failed</h3>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
                    <button className="btn btn-secondary" style={{ marginLeft: "10px" }} onClick={() => window.history.back()}>Back</button>
                </div>
            )}
            {!error && !clientSecret && (
                <div style={{ textAlign: "center", marginTop: "50px" }}>Loading secure payment...</div>
            )}
            {!error && clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm amount={amount} />
                </Elements>
            )}
        </div>
    );
}
