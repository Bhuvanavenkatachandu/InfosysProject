import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe("pk_test_51SgeU8BVju1ZUEzBUORvqrJUj9NEZH87rT3x3uYnEHJrIEoqotLCUATlgptj6N42ZVhkT6IN3ndg5k76tLFJFrca00o9L6CLGi");

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: window.location.origin,
            },
            redirect: "if_required" // Important for handling success in-place if no redirect needed
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
                alert("Payment Failed: " + error.message);
            } else {
                setMessage("An unexpected error occurred.");
                alert("Payment Failed: An unexpected error occurred.");
            }
        } else {
            if (paymentIntent && paymentIntent.status === "succeeded") {
                setMessage("Payment Successful!");
                alert("Payment Successful!");
            } else {
                setMessage("Payment processing...");
            }
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" }}>
            <PaymentElement id="payment-element" />
            <button disabled={isLoading || !stripe || !elements} id="submit" style={{ marginTop: "20px", width: "100%", padding: "10px", backgroundColor: "#5469d4", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                <span id="button-text">
                    {isLoading ? "Paying..." : `Pay Now (₹${amount})`}
                </span>
            </button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message" style={{ marginTop: "10px", textAlign: "center", color: message.includes("Failed") ? "red" : "green" }}>{message}</div>}
        </form>
    );
}

export default function App() {
    const [amount, setAmount] = useState(100);

    useEffect(() => {
        setClientSecret(""); // Reset client secret while fetching new one
        // Create PaymentIntent as soon as amount changes
        fetch("http://localhost:8081/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: Number(amount) }), // Use dynamic amount
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret))
            .catch(err => console.error("PoC Fetch Error:", err));
    }, [amount]);

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="App" style={{ fontFamily: "Arial, sans-serif", padding: "50px", maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center" }}>Stripe Payment PoC (India)</h1>

            <div style={{ margin: "20px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>Ride Amount (₹):</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
            </div>

            {clientSecret && (
                <Elements options={options} stripe={stripePromise} key={clientSecret}>
                    <CheckoutForm amount={amount} />
                </Elements>
            )}
            {!clientSecret && <p style={{ textAlign: "center" }}>Updating payment intent for ₹{amount}...</p>}
        </div>
    );
}
