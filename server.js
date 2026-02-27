// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// 1. IMPORTAR LIBRERÍAS
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const path = require('path');

// 2. CONFIGURACIÓN DEL SERVIDOR
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares (herramientas que usa el servidor)
app.use(cors()); // Permite que tu página web (frontend) hable con este servidor (backend)
app.use(express.json()); // Permite al servidor entender JSON
app.use(express.static(path.join(__dirname))); // Sirve los archivos HTML, CSS, JS de la carpeta

// --- BASE DE DATOS SIMULADA ---
// En una app real, usarías MongoDB, PostgreSQL, etc.
// Por ahora, un objeto es suficiente para guardar quién pagó.
const pagosConfirmados = {};

// 3. ENDPOINT PARA CREAR LA SESIÓN DE PAGO
// Cuando el usuario hace clic en "Pagar", tu frontend llamará a esta URL.
app.post('/create-checkout-session', async (req, res) => {
    const { priceId, userEmail } = req.body;

    // Validación básica
    if (!priceId || !userEmail) {
        return res.status(400).json({ error: 'Faltan el priceId o el userEmail.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: userEmail,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:${PORT}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:${PORT}/cancel.html`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error al crear la sesión de Stripe:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// 4. WEBHOOK PARA RECIBIR CONFIRMACIONES DE STRIPE (¡El método más seguro!)
// Stripe enviará una notificación a esta URL cuando un pago se complete.
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // NOTA: Para producción, DEBES verificar la firma del webhook con tu webhook secret.
    // Para pruebas, podemos omitirlo por simplicidad.
    // event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    try {
        event = JSON.parse(req.body);
    } catch (err) {
        console.log(`⚠️  Webhook error al parsear el payload.`);
        return res.status(400).send('Webhook error: invalid payload');
    }

    // Manejar el evento 'checkout.session.completed'
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`✅ Pago exitoso para: ${session.customer_email}`);
        
        // ¡AQUÍ GUARDAS LA INFORMACIÓN!
        // Guardamos el ID de la sesión para poder verificarlo después.
        pagosConfirmados[session.id] = {
            email: session.customer_email,
            paid: true
        };
    }

    // Devolver una respuesta 200 OK a Stripe
    res.json({received: true});
});

// 5. ENDPOINT PARA VERIFICAR EL PAGO EN EL FRONTEND
// La página success.html usará esta para saber si puede mostrar el enlace.
app.get('/verify-payment', (req, res) => {
    const sessionId = req.query.session_id;
    
    if (pagosConfirmados[sessionId] && pagosConfirmados[sessionId].paid) {
        res.json({ status: 'paid', telegramLink: 'https://t.me/VIPSignalsExclusive' });
    } else {
        res.status(404).json({ status: 'not_found_or_pending' });
    }
});

// INICIAR EL SERVIDOR
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
