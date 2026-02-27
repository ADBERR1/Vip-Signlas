// routes/webhook.js

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

// === ¡LÍNEA QUE FALTABA! ===
// Aquí estamos importando la librería de Stripe y dándole nuestra clave secreta.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// ==========================

// Requiere el body-parser en modo crudo para los webhooks de Stripe
router.post('/', bodyParser.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ Firma del webhook verificada correctamente.');
    } catch (err) {
        console.error(❌ Error de verificación de firma: ${err.message});
        return res.status(400).send(Webhook Error: ${err.message});
    }

    // Manejar el evento
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(🎉 Pago completado para la sesión: ${session.id});
            
            // === AQUÍ VA TU LÓGICA DE NEGOCIO ===
            console.log('--- Datos de la Sesión ---');
            console.log('Email del Cliente:', session.customer_details.email);
            
            // NOTA: display_items está obsoleto. Lo correcto es usar line_items.
            // Si esto te da error, usa la versión de abajo.
            console.log('ID del Producto:', session.line_items.data[0].price.id);
            
            console.log('--------------------------');
            console.log('✅ ACCIÓN: Conceder acceso VIP al usuario y mostrar enlace de Telegram.');
            // === FIN DE TU LÓGICA DE NEGOCIO ===
            break;

        default:
            console.log(👾 Evento no manejado: ${event.type});
    }

    res.json({ received: true });
});

module.exports = router;