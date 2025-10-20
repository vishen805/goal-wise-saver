const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
app.use(cors());
app.use(express.json());

// Connection config for LocalDB (SQL Server Express LocalDB)
// Adjust the instance name if needed (e.g., (localdb)\\MSSQLLocalDB)
const config = {
  server: '(localdb)\\MSSQLLocalDB',
  database: 'SmartSaverDB',
  options: {
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

app.get('/sync', async (req, res) => {
  try {
    await sql.connect(config);

    // Example queries - assumes tables exist: Expenses, SavingsGoals, Budgets
    const expensesResult = await sql.query`SELECT * FROM Expenses`;
    const goalsResult = await sql.query`SELECT * FROM SavingsGoals`;
    const budgetsResult = await sql.query`SELECT * FROM Budgets`;

    res.json({
      expenses: expensesResult.recordset,
      savingsGoals: goalsResult.recordset,
      budgets: budgetsResult.recordset,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Sync error', err);
    res.status(500).json({ error: err.message || String(err) });
  } finally {
    try { await sql.close(); } catch (e) {}
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
