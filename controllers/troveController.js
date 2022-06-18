const { validationResult } = require("express-validator");
const troveModel = require("../models/trove");
const { mintToken } = require("../services/gens");
const { transferToken } = require("../services/transfergens");
const { setTroveReceived, liquidateTrove } = require("../services/program");
const { getTrove } = require("../services/trove");
const { increaseCounters, decreaseCounters } = require("../services/counters");
const { BN } = require("bn.js");
const { getCollateral } = require("../utils/helpers");
const { claimReward } = require("../commands/claimReward");
const axios = require('axios')

// import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js'
// import { PythHttpClient } from '@pythnetwork/client';


const MIN_DEPOSIT_FEES = 4;
const MIN_TEAM_FEES = 1;
const DEPOSIT_FEE_PERCENT = 1;
const TEAM_FEE_PERCENT = 0.47;

//TODO fix the partial payment for borrow
class troveController {
    async upsert(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: "Error:", errors });
            }
            let address = req.body.user;
            let trove = req.body.trove;
            let amount = req.body.amount;
            let destination = req.body.dest;
            let data = req.body.data
            // TODO refractor this code. Make a separate function to get the dep fee
            let depositorFee = amount * (DEPOSIT_FEE_PERCENT / 100);
            depositorFee =
                depositorFee < MIN_DEPOSIT_FEES ? MIN_DEPOSIT_FEES : depositorFee;

            let teamFee = req.body.amount * (TEAM_FEE_PERCENT / 100);
            teamFee = teamFee < MIN_TEAM_FEES ? MIN_TEAM_FEES : teamFee;

            // const troveData = await getTrove({ trove });

            const user = data.owner;
            trove = data.troveAccountPubkey;
            let model = await troveModel.findOrCreateByAddress(user, trove);
            let lamports = 0;

            let sentAmount = Number(amount) - depositorFee - teamFee;
            // let sentAmount = Number(amount); // collateral ratio is calculated based only on the raw amount

            if (!model.amountSent) {
                model.amountSent = sentAmount;
                model.depositorFee = data.depositorFee / 1000;
                model.teamFee = data.teamFee / 1000;
                lamports = data.lamports;
            }

            if (!data.isReceived) {
                await setTroveReceived({ trove });

                increaseCounters({
                    coin: 0,
                    token: data.depositorFee,
                    governance: 0,
                    deposit: 0,
                    trove: sentAmount,
                    collateral: lamports,
                });
            }

            await troveModel.model.updateMany(
                { _id: model._id },
                { $set: { ...model } }
            );
            console.log("the trove model set is ", { _id: model._id }, { ...model });

            res.json({ model });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }

    //add borrow collateral
    async addBorrow(req, res) {

        try {
            let address = req.body.user;
            let trove = req.body.trove;
            let destination = req.body.dest;


            // TODO refractor this code. Make a separate function to get the dep fee
            // let depositorFee = req.body.amount * (DEPOSIT_FEE_PERCENT / 100);
            // depositorFee =
            //     depositorFee < MIN_DEPOSIT_FEES ? MIN_DEPOSIT_FEES : depositorFee;

            // let teamFee = req.body.amount * (TEAM_FEE_PERCENT / 100);
            // teamFee = teamFee < MIN_TEAM_FEES ? MIN_TEAM_FEES : teamFee;
            let amount = req.body.amount;

            console.log("add borrow is activated");
            const troveData = await getTrove({ trove });
            const user = troveData.owner;
            trove = troveData.troveAccountPubkey;
            let model = await troveModel.findOrCreateByAddress(user, trove);
            let lamports = troveData.lamports;

            console.log("the trove model after log out ", troveData);

            //   let sentAmount = Number(amount) - depositorFee - teamFee;
            let sentAmount = Number(amount); // sent raw amount without the fees deducted
            await setTroveReceived({ trove });

            increaseCounters({
                coin: 0,
                token: troveData.depositorFee,
                governance: 0,
                deposit: 0,
                trove: sentAmount,
                collateral: lamports,
            });

            model.amountSent = Number(model.amountSent) + sentAmount;
            model.depositorFee = Number(troveData.depositorFee) / 1000;
            model.teamFee = Number(troveData.teamFee) / 1000;

            await troveModel.model.updateMany(
                { _id: model._id },
                { $set: { ...model } }
            );

            res.json({ model });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }

    // list of borrowers for the liquidation page
    async getList(req, res) {
        let price;

        try {
            await axios.get(
                "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
            )
                .then(({ data }) => {
                    if (data.solana) {
                        price = data.solana.usd
                    }
                });
        } catch (err) {
            console.log("Data fetch error", err);
        }

        // const pythClient = new PythHttpClient(connection, pythPublicKey);
        // const data = await pythClient.getData();

        // for (let symbol of data.symbols) {
        //   const price = data.productPrice.get(symbol)!;
        //   // Sample output:
        //   // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
        //   console.log(`${symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`)
        // }

        try {
            const pageCount = troveModel.pageCount;
            const { page = 1, query, sort_field, sort_direction } = req.query;
            const entities = await troveModel.getAll(query);
            let result = [];

            for (const entity of entities) {
                try {
                    const troveData = await getTrove({ trove: entity.trove });
                    result.push({ ...entity, ...troveData });
                } catch (err) {
                    console.log("This is showing error here", err);
                    continue;
                }
            }

            console.log(price, "the price of sol")
            result = result.map((entity) => {
                return {
                    ...entity,
                    debtRatio: `${getCollateral(
                        entity.borrowAmount,
                        entity.lamports,
                        (price * 100).toString(),
                    )}%`, // TODO fix it here for the USD PRICE is set to 125
                };
            });

            if (sort_field && sort_direction) {
                console.log(sort_field, "Value of sort")
                result.sort((a, b) => {
                    console.log(a, "inside a of sort")

                    if (a[sort_field] > b[sort_field]) {
                        return sort_direction === "asc" ? 1 : -1;
                    } else if (a[sort_field] < b[sort_field]) {
                        return sort_direction === "asc" ? -1 : 1;
                    } else {
                        return 0;
                    }
                });
            }

            res.json({
                entities: result.slice((page - 1) * pageCount, page * pageCount),
                total_count: result.length,
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }

    // pay borrow trove call
    async payBorrow(req, res) {
        try {
            let payAmount = req.body.amount;
            let trove = req.body.trove.trim();
            let troveData = await getTrove({ trove });
            const troveModelData = await troveModel.getByTrove(trove);

            // TODO refractor this code. Make a separate function to get the dep fee
            let depositorFee = payAmount * (DEPOSIT_FEE_PERCENT / 100);
            depositorFee =
                depositorFee < MIN_DEPOSIT_FEES ? MIN_DEPOSIT_FEES : depositorFee;

            if (troveData !== null) {
                decreaseCounters({
                    coin: 0,
                    token: 0,
                    governance: 0,
                    deposit: 0,
                    trove: payAmount,
                    collateral: 0,
                });
                // return res.json({status: true, trove, troveData})
            }

            troveModelData.depositorFee = Number(troveData.depositorFee) / 1000;
            troveModelData.teamFee = Number(troveData.teamFee) / 1000;

            res.json({ status: false, trove, troveData });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }

    // close trove
    async closeTrove(req, res) {
        try {
            let trove = req.body.trove.trim();
            let data = req.body.data;

            // let troveData = await getTrove({ trove });

            const troveModelData = await troveModel.getByTrove(trove);

            if (troveModelData) {
                await troveModel.model.deleteOne({ trove });
            }

            console.log("before liquidating......");
            // TODO check this later
            // && troveData.isReceived
            if (data !== null && !data.isLiquidated) {
                let oldData = data;
                if (data === null) {
                    decreaseCounters({
                        coin: 0,
                        token: 0,
                        governance: 0,
                        deposit: 0,
                        trove: oldData.borrowAmount,
                        collateral: oldData.lamports,
                    });

                    increaseCounters({
                        coin: new BN(oldData.lamports).div(new BN("1000000000")),
                        token: 0,
                        governance: 0,
                        deposit: 0,
                        trove: 0,
                        collateral: 0,
                    });
                    return res.json({ status: true, trove, data });
                }
            }
            res.json({ status: false, trove });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }

    // liquidating trove call
    async liquidateTrove(req, res) {
        try {
            let trove = req.body.trove.trim();

            let troveData = await getTrove({ trove });

            const troveModelData = await troveModel.getByTrove(trove);

            if (troveModelData) {
                await troveModel.model.deleteOne({ trove });
            }

            console.log("before liquidating......");
            // TODO check this later
            // && troveData.isReceived
            if (troveData !== null && !troveData.isLiquidated) {
                let oldData = troveData;
                troveData = await liquidateTrove({ trove });

                if (troveData === null) {
                    decreaseCounters({
                        coin: 0,
                        token: 0,
                        governance: 0,
                        deposit: 0,
                        trove: oldData.borrowAmount,
                        collateral: oldData.lamports,
                    });

                    increaseCounters({
                        coin: new BN(oldData.lamports).div(new BN("1000000000")),
                        token: 0,
                        governance: 0,
                        deposit: 0,
                        trove: 0,
                        collateral: 0,
                    });
                    return res.json({ status: true, trove, troveData });
                }
            }
            res.json({ status: false, trove });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }

    async getByUserAndTrove(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: "Error:", errors });
            }
            let user = req.query.user;
            user = user.trim();
            let model = await troveModel.getByUser(user);

            res.json({ model });
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: "Error: " + err });
        }
    }
}

module.exports = new troveController();
