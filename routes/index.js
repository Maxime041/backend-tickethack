var express = require('express');
var router = express.Router();
const Ticket = require("../models/ticket.js");
const moment = require("moment");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/tickets", async (req, res) => {
  try {
      const departure = req.body.departure;
      const arrival = req.body.arrival;
      const date = req.body.date;

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

      const tickets = await Ticket.find({departure: departure,arrival: arrival,date: { $gte: momentDate.toDate(), $lte: endOfDay.toDate() }});


      if (tickets.length === 0) {
          return res.json({ result: false, error: "Aucun ticket trouvé avec les critères fournis." });
      }

      res.json({ result: true, tickets: tickets });

  } catch (err) {
      res.json({ result: false, error: "Erreur serveur, veuillez réessayer plus tard." });
  }
});



module.exports = router;
