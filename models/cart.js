const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    id_ticket: String,
});

const Cart = mongoose.model("carts", cartSchema);

module.exports = Cart;
