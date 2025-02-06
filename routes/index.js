var express = require('express');
var router = express.Router();
const Ticket = require("../models/ticket.js");
const Cart = require("../models/cart.js");
const Booking = require("../models/bookings.js");
const moment = require("moment");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Thunder client : http://localhost:3000/tickets?departure=Paris&arrival=Lyon&date=2025-02-05%2010:30 */

router.get("/tickets", async (req, res) => {
    try {
        const departure= req.query.departure;
        const arrival = req.query.arrival;
        const date = req.query.date;
  
        if (!departure || !arrival || !date) 
        {
            return res.json({ result: false, error: "Les champs 'departure', 'arrival' et 'date' sont obligatoires." });
        }
  
        const momentDate = moment.utc(date, "YYYY-MM-DD HH:mm", true);
  
        if (!momentDate.isValid()) 
        {
            return res.json({ result: false, error: "La date fournie est invalide. Veuillez utiliser le format 'YYYY-MM-DD HH:mm'." });
        }
        const endOfDay = momentDate.clone().endOf("day"); 
  
        const tickets = await Ticket.find({
            departure: departure,
            arrival: arrival,
            date: { $gte: momentDate.toDate(), $lte: endOfDay.toDate() } 
        });
  
  
        if (tickets.length == 0) 
        {
            return res.json({ result: false, error: "Aucun ticket trouvé avec les critères fournis." });
        }
  
        res.json({ result: true, tickets: tickets });
  
    } catch (err) {
        res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
    }
});


/* Thunder client : http://localhost:3000/cart/:id_ticket 
// id_client = 67a36e98949d80b00cae89fa (exemple) */

router.post("/cart/:id_ticket", async (req, res) => {
  try {
      const id_ticket = req.body.id_ticket;

      if (!id_ticket) {
          return res.json({ result: false, error: "L'ID du ticket est obligatoire." });
      }

      const newCart = new Cart({ id_ticket });

      await newCart.save();

      res.json({ result: true, message: "Ticket ajouté au panier avec succès.", cart: newCart });
  } catch (err) {
      res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
  }
});

/* Thunder client : http://localhost:3000/cart */

router.get("/cart", async (req, res) => {
    try {
        const cartItems = await Cart.find();  
        if (cartItems.length == 0) 
        {
            return res.json({ result: false, error: "Le panier est vide." });
        }
  
        const ticketIds = cartItems.map(item => item.id_ticket); 
  
        const tickets = await Ticket.find({ _id: { $in: ticketIds } });

        const updatedTickets = tickets.map(ticket => {
            const cartItem = cartItems.find(item => item.id_ticket == ticket._id);
            let ticketObj = ticket.toObject();
            ticketObj.id_cart = cartItem ? cartItem._id : null;
            return ticketObj;
        });
        
        res.json({ result: true, tickets: updatedTickets });
    } catch (err) {
        res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
    }
  });

/* Thunder client : http://localhost:3000/cart/:id
// id = 67a36e98949d80b00cae89fa (exemple) */

router.delete("/cart/:id", async (req, res) => {
  try {
      const cartId = req.params.id;

      if (!cartId) 
      {
          return res.json({ result: false, error: "L'ID du ticket est obligatoire." });
      }

      const deletedItem = await Cart.findByIdAndDelete(cartId);

      if (!deletedItem) 
      {
          return res.json({ result: false, error: "Ticket non trouvé dans le panier." });
      }

      res.json({ result: true, message: "Ticket supprimé du panier avec succès." });
  } catch (err) {
    res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
  }
});

/* Thunder client : http://localhost:3000/purchase */

router.post("/purchase", async (req, res) => {
  try {
      const cart = await Cart.find();

      if (cart.length == 0) 
      {
          return res.json({ result: false, error: "Le panier est vide. Ajoutez des tickets avant de payer." });
      }

      const bookings = cart.map(item => ({ id_ticket: item.id_ticket }));

      await Booking.insertMany(bookings);

      await Cart.deleteMany({});

      res.json({ result: true, message: "Paiement réussi ! Les tickets ont été enregistrés.", bookings: bookings });
  } catch (err) {
      res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
  }
});

/* Thunder client : http://localhost:3000/bookings */

router.get("/bookings", async (req, res) => {
  try {
      const bookings = await Booking.find();

      if (bookings.length === 0) 
      {
          return res.json({ result: false, error: "Aucune réservation trouvée." });
      }

      const ticketIds = bookings.map(booking => booking.id_ticket);
      const tickets = await Ticket.find({ _id: { $in: ticketIds } });

      res.json({ result: true, bookings: tickets });
  } catch (err) {
    res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
  }
});


module.exports = router;
