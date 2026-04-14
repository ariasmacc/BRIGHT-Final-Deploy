const Document = require('../models/Document');

exports.getAllDocuments = (req, res) => {
  Document.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};