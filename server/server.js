// 1. First, we import the path module
const path = require('path');

// 2. Now that 'path' is defined, we can safely use it to find your .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 3. Set the timezone
process.env.TZ = 'Asia/Manila';
console.log("Server time set to:", new Date().toString());

// 4. Import the rest of your tools
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

// --- [UPDATED] FILE RESCUE OPERATION (Database + Uploads) ---
function syncUploadsToVolume() {
   console.log("🔄 Starting File Rescue Operation...");
  
   const dbFileName = 'BRIGHTDatabase.db';
   const sourceDb = path.join(__dirname, 'data', dbFileName);
   const sourceUploads = path.join(__dirname, 'data'); 

   let destRoot;
   if (process.env.RAILWAY_ENVIRONMENT_NAME) {
       destRoot = '/app/data'; // Railway Volume
   } else {
       console.log("ℹ️ Local environment. Skipping rescue.", sourceDb);
       return;
   }

   const destUploads = path.join(destRoot, 'uploads');
   const destDb = path.join(destRoot, dbFileName);

   if (!fs.existsSync(destRoot)){
       fs.mkdirSync(destRoot, { recursive: true });
   }

   if (!fs.existsSync(destDb)) {
       if (fs.existsSync(sourceDb)) {
           try {
               fs.copyFileSync(sourceDb, destDb);
               console.log(`✅ [DB RESTORE] Database copied to Volume successfully!`);
           } catch (err) {
               console.error(`❌ [DB ERROR] Failed to copy database:`, err.message);
           }
       }
   }

   if (!fs.existsSync(destUploads)){
       fs.mkdirSync(destUploads, { recursive: true });
   }

   if (fs.existsSync(sourceUploads)) {
       const files = fs.readdirSync(sourceUploads);
       files.forEach(file => {
           const srcFile = path.join(sourceUploads, file);
           const destFile = path.join(destUploads, file);
           if (!fs.existsSync(destFile)) {
               try {
                   fs.copyFileSync(srcFile, destFile);
               } catch (err) { }
           }
       });
       console.log(`✅ [UPLOADS] Synced missing files.`);
   }
}

// --- NEW IMPORTS ---
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const auth = require('./middleware/auth');
const checkRole = require('./middleware/checkRole');

// --- Import ALL Routes ---
const budget = require('./routes/budget');
const expenses = require('./routes/expenses');
const documents = require('./routes/documents');
const transaction = require('./routes/transaction');
const validation = require('./routes/validation');
const users = require('./routes/users');
const overview = require('./routes/overview');
const categoryRoutes = require('./routes/categoryRoutes');

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- UPLOAD CONFIGURATION (FIXED) ---
const UPLOAD_DIR = process.env.RAILWAY_ENVIRONMENT_NAME
   ? '/app/data/uploads'
   : path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOAD_DIR));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// --- Middleware ---
const corsOptions = {
   origin: ['http://localhost:5173', 'https://bright-project.up.railway.app'], 
   credentials: true,               
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const transporter = nodemailer.createTransport({
   service: 'gmail',
   host: 'smtp.gmail.com', 
   port: 465,
   secure: true,
   auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
   }
});

transporter.verify((error, success) => {
   if (error) console.error("❌ Email Transporter Error:", error);
   else console.log("✅ Gmail Server is ready to send OTPs!");
});

app.set('transporter', transporter);

// --- API Routes ---
app.use('/api/public/overview', overview);
app.use('/api/public/transactions', transaction);
app.use('/api/public/documents', documents);

app.use('/api/budget', auth, checkRole('Admin', 'Validator'), budget);
app.use('/api/expenses', auth, checkRole('Admin', 'Validator'), expenses);
app.use('/api/categories', auth, checkRole('Admin'), categoryRoutes);
app.use('/api/transactions', auth, checkRole('Admin', 'Validator'), transaction);
app.use('/api/documents', auth, checkRole('Admin', 'Validator'), documents);
app.use('/api/overview', auth, checkRole('Admin', 'Validator'), overview);
app.use('/api/validation', auth, checkRole('Admin', 'Validator'), validation);
app.use('/api/users', users);

// --- Admin Tools ---
app.get('/admin/view-audit-ledger', (req, res) => {
   let logPath = process.env.RAILWAY_ENVIRONMENT_NAME
       ? '/app/data/blockchain_audit_ledger.txt'
       : path.join(__dirname, 'blockchain_audit_ledger.txt');

   if (fs.existsSync(logPath)) {
       fs.readFile(logPath, 'utf8', (err, data) => {
           if (err) return res.status(500).send("Error reading log file.");
           res.send(`
               <html>
               <body style="font-family: monospace; background: #1e1e1e; color: #00ff00; padding: 20px;">
                   <h1>📜 Blockchain Audit Ledger</h1>
                   <textarea style="width: 100%; height: 800px; background: #000; color: #0f0; border: 1px solid #555; padding: 15px;">${data}</textarea>
               </body>
               </html>
           `);
       });
   } else {
       res.send("<h1>📜 Blockchain Audit Ledger</h1><p>No records found yet.</p>");
   }
});

app.get('/admin/download-ledger', auth, checkRole('Admin'), (req, res) => {
   let logPath = process.env.RAILWAY_ENVIRONMENT_NAME
       ? '/app/data/blockchain_audit_ledger.txt'
       : path.join(__dirname, 'blockchain_audit_ledger.txt');

   if (fs.existsSync(logPath)) res.download(logPath, 'OFFICIAL_AUDIT_LEDGER.txt');
   else res.status(404).send("Ledger file not found.");
});

app.get('/admin/download-db', auth, checkRole('Admin'), (req, res) => {
   const volumePath = '/app/data/BRIGHTDatabase.db';
   const localPath = path.join(__dirname, 'data','BRIGHTDatabase.db');
   const dbFile = fs.existsSync(volumePath) ? volumePath : localPath;

   if (fs.existsSync(dbFile)) res.download(dbFile, 'BRIGHTDatabase_Backup.db');
   else res.status(404).send("Database file not found.");
});

const db = require('./config/database');
db.serialize(() => {
   db.run("ALTER TABLE Users ADD COLUMN two_fa_code TEXT", (err) => {});
   db.run("ALTER TABLE Users ADD COLUMN two_fa_expires DATETIME", (err) => {});
   db.run("ALTER TABLE Users ADD COLUMN reset_token TEXT", (err) => {});
   db.run("ALTER TABLE Users ADD COLUMN reset_token_expires DATETIME", (err) => {});
});

syncUploadsToVolume();

// --- [FINAL PATH LOGIC] ---
const clientBuildPath = path.join(process.cwd(), 'client', 'dist');

console.log("🛠️ Checking Frontend Path:", clientBuildPath);

if (fs.existsSync(clientBuildPath)) {
    console.log("✅ dist folder found! Serving React...");
    app.use(express.static(clientBuildPath));
} else {
    console.warn("⚠️ dist folder NOT found at:", clientBuildPath);
}

app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send(`Frontend files missing. Path checked: ${clientBuildPath}`);
    }
});