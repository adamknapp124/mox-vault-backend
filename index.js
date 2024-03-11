const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const mysql = require('mysql2');
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Talon511!',
	database: 'mox_vault',
});

db.connect();

console.log('FROM SCRATCH');

app.post('/sendIt', (req, res) => {
	const cardData = req.body;
	console.log(cardData);

	const sql = `INSERT INTO collection (id, name, image, cmc, artist, oracle_text, set_name, rarity, type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

	db.query(
		sql,
		[
			cardData.id,
			cardData.name,
			cardData.image,
			cardData.cmc,
			cardData.artist,
			cardData.oracle_text,
			cardData.set_name,
			cardData.rarity,
			cardData.type,
		],
		(err, result) => {
			if (err) {
				console.error('Error inserting data', err);
				res.status(500).json({ error: 'Error inserting data' });
				return;
			}

			console.log('Inserted into database', result);
		}
	);
});

app.listen(3500, () => {
	console.log('App listening on port 3500');
});
