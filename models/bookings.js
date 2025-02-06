const mongoose = require("mongoose");

const bookingsSchema = mongoose.Schema({
    id_ticket: String,
});

const Bookings = mongoose.model("bookings", bookingsSchema);

module.exports = Bookings;
