const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const mysql = require('mysql2/promise');
const db = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: 'Talon511!',
	database: 'mox_vault',
});

app.post('/migrate-data', (req, res) => {
	const cardData = req.body;
	console.log(cardData);
});

app.post('/sendIt', async (req, res) => {
	try {
		const card = req.body;
		const connection = await db.getConnection();

		db.query(
			'SELECT * FROM collection WHERE card_id = ?',
			[card.card_id],
			(err, rows) => {
				if (err) {
					console.error('Error checking data', err);
					res.status(500).json({ error: 'Error checking data' });
					return;
				}

				if (rows.length > 0) {
					db.query(
						'UPDATE collection SET quantity = quantity + ? WHERE card_id = ?',
						[card.quantity, card.card_id],
						(updateErr, updateResult) => {
							if (updateErr) {
								console.error('Error updating card', updateErr);
								res.status(500).json({ error: 'Error adding card' });
								return;
							}
							res.status(200).json({
								message: 'Card updated successfully',
							});
						}
					);
				} else {
					const sql = `INSERT INTO collection (card_id, quantity, name, image, cmc, artist, oracle_text, set_name, rarity, type, price)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

					db.query(
						sql,
						[
							card.card_id,
							card.quantity,
							card.name,
							card.image,
							card.cmc,
							card.artist,
							card.oracle_text,
							card.set_name,
							card.rarity,
							card.type,
							card.price,
						],
						(err, result) => {
							if (result.quantity === 1) {
								console.log(result.quantity);
							}
							if (err) {
								console.error('Error inserting data', err);
								res.status(500).json({ error: 'Error inserting data' });
								return;
							}
							console.log('Inserted into database', result);
						}
					);
				}
			}
		);
	} catch (error) {
		console.log('error: ', error);
	}
});

app.get('/collection/total', async (req, res) => {
	try {
		const [collectionData] = await db.query('SELECT quantity, price FROM collection');

		const totalValue = collectionData.reduce((total, card) => {
			return total + card.quantity * parseFloat(card.price);
		}, 0);

		res.status(200).json({ totalValue });
	} catch (error) {
		console.log('Error:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(3500, () => {
	console.log('App listening on port 3500');
});
