package com.stripe.sample;

import java.nio.file.Paths;

import static spark.Spark.post;
import static spark.Spark.port;
import static spark.Spark.staticFiles;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

public class Server {

  public static void main(String[] args) {
    port(4242);

    // This is your test secret API key.
    Stripe.apiKey = "pk_test_51SgaUp2LA6dgBJdr5G1YqfHWRF50oollzywmzLh2QEHYa2gvPF7VAPiVFKYStkC9BAyxhDtyfSWehHLnLsijh7fG00cr1wNFuV";

    staticFiles.externalLocation(
        Paths.get("public").toAbsolutePath().toString());

    post("/create-checkout-session", (request, response) -> {
        String https://atlas-university.site/Vip-Signlas/ = "http://localhost:4242";
        SessionCreateParams params =
          SessionCreateParams.builder()
            .setCustomerEmail("customer@example.com")
            .setSubmitType(SessionCreateParams.SubmitType.DONATE)
            .setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)
            .setShippingAddressCollection(
              SessionCreateParams.ShippingAddressCollection.builder()
                .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.CA)
                .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.US)
                .build())
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl(YOUR_DOMAIN + "/success.html")
            .setAutomaticTax(
              SessionCreateParams.AutomaticTax.builder()
                .setEnabled(true)
                .build())
            .setCustomerCreation(SessionCreateParams.CustomerCreation.ALWAYS)
            // Provide the Customer ID (for example, cus_1234) for an existing customer to associate it with this session
            // .setCustomer("{{CUSTOMER_ID}}")
            .addLineItem(
              SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                // Provide the exact Price ID (for example, price_1234) of the product you want to sell
                .setPrice("price_1T5K0x2LA6dgBJdrsPM9wH0U")
                .build())
            .build();
      Session session = Session.create(params);

      response.redirect(session.getUrl(), 303);
      return "";
    });
  }
}
