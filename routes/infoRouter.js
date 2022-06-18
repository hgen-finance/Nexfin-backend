const express = require("express");
const router = express.Router();
const notificationModel = require("../models/notification");
const BN = require("bn.js");
const { getSolPrice } = require("../services/counters");
const data = require("../counters.json");

router.get("/", [], (req, res) => {
    const data = require("../counters.json");
    const debtRatio = new BN(data.collateral)
        .mul(new BN(100)) // to percent
        .mul(new BN(parseInt(getSolPrice() * 100)))
        .div(new BN(100)) //sol price
        .div(new BN(1000000000))
        .div(new BN(data.troveTotal == 0 ? 1 : data.troveTotal))
        .toNumber();

    console.log("Info router was called");
    res.json({
        totalLiquidationMode: debtRatio < 110,
        debtRatio,
        ...data,
    });
});

// router.post('/email', [
// ], async (req, res) => {

//   const user = req.body.user
//   const email = req.body.email

//   const model = await notificationModel.create(user,email)

//   res.json({model})
// })

module.exports = router;
