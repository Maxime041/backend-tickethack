const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema({
    departure: String,
    arrival: String,
    date: Date,
    price: Number
});

const Ticket = mongoose.model("tickets", ticketSchema);

module.exports = Ticket;
