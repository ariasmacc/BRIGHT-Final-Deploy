// server.js

require('dotenv').config();

// CRITICAL: Sets the server timezone to Philippine time
process.env.TZ = 'Asia/Manila';
console.log("Server time set to:", new Date().toString());

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs'); // <--- ITO ANG KULANG MO KANINA. HUWAG BUBURAHIN.

// --- [UPDATED] FILE RESCUE OPERATION (Database + Uploads) ---
function syncUploadsToVolume() {
    console.log("🔄 Starting File Rescue Operation...");
    
    // 1. Setup Paths
    // NOTE: Siguraduhin na TAMA ang pangalan ng DB file mo dito (e.g. BRIGHTDatabase.db)
    const dbFileName = 'BRIGHTDatabase.db';  //updated
    
    // Source (Galing sa deployment folder)
    const sourceDb = path.join(__dirname, 'data', dbFileName);  //updated
    const sourceUploads = path.join(__dirname, 'data');  //updated 
  

    let destRoot;
    // Gamitin ang bagong variable check
    if (process.env.RAILWAY_ENVIRONMENT_NAME) {
        destRoot = '/app/data'; // Railway Volume
    } else {
        console.log("ℹ️ Local environment. Skipping rescue.", sourceDb); //updated
        return; 
    }

    const destUploads = path.join(destRoot, 'uploads');
    const destDb = path.join(destRoot, dbFileName);

    // 2. Ensure Volume Exists
    if (!fs.existsSync(destRoot)){
        fs.mkdirSync(destRoot, { recursive: true });
    }

    // --- PART A: RESCUE DATABASE (Ito ang fix sa Login 500 Error) ---
    if (!fs.existsSync(destDb)) {
        if (fs.existsSync(sourceDb)) {
            try {
                fs.copyFileSync(sourceDb, destDb);
                console.log(`✅ [DB RESTORE] Database copied to Volume successfully!`);
            } catch (err) {
                console.error(`❌ [DB ERROR] Failed to copy database:`, err.message);
            }
        } else {
            console.error(`⚠️ Source database not found at ${sourceDb}. Make sure it is committed to GitHub!`);
        }
    } else {
        console.log(`ℹ️ Database already exists in Volume. Skipping copy to prevent overwrite.`);
    }

    // --- PART B: RESCUE UPLOADS ---
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

// --- ADD THESE NEW IMPORTS ---
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// --- END NEW IMPORTS ---

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
const UPLOAD_DIR = process.env.RAILWAY_ENVIRONMENT 
    ? '/app/data/uploads' 
    : path.join(__dirname, 'templates/uploads');

// Ensure folder exists immediately
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 1. Standard Way: Para sa mga tamang upload
app.use('/uploads', express.static(UPLOAD_DIR));

// 2. TEMPORARY FIX: Para sa mga lumang upload na may "Cannot GET" error
app.use('/app/data/uploads', express.static(UPLOAD_DIR));
app.use('/app//uploads', express.static(UPLOAD_DIR));
// ------------------------------------

app.get('/favicon.ico', (req, res) => res.status(204).end());

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'templates')));
app.use(cookieParser());

// --- HTTP EMAIL TRANSPORTER (BYPASSING RAILWAY FIREWALL) ---
// Dahil blocked ang SMTP ports sa Railway, gagamitin natin ang Brevo Web API via HTTP.

const transporter = {
    // 1. Fake Verify function para hindi mag-error sa startup
    verify: (callback) => {
        console.log("✅ HTTP EMAIL MODE: Ready to bypass firewall via Brevo API.");
        if (callback) callback(null, true);
    },

    // 2. Custom SendMail function na gumagamit ng FETCH
    sendMail: async (mailOptions) => {
        console.log(`📤 Sending email via HTTP API to: ${mailOptions.to}`);

        try {
            // Siguraduhing may API Key
            if (!process.env.EMAIL_API_KEY) {
                throw new Error("Missing EMAIL_API_KEY in .env");
            }

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.EMAIL_API_KEY, // Ito ang susi
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { 
                        name: "BRIGHT System", 
                        email: process.env.EMAIL_USER // Email na registered sa Brevo
                    },
                    to: [{ email: mailOptions.to }], // Brevo requires array of objects
                    subject: mailOptions.subject,
                    htmlContent: mailOptions.html || mailOptions.text
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Brevo API Error:", errorText);
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ Email Sent via API! ID:", data.messageId);
            
            // Return fake info para akala ng controller successful ang SMTP
            return { messageId: data.messageId }; 

        } catch (err) {
            console.error("❌ HTTP Email Failed:", err);
            throw err; // Ipasa ang error sa controller para mahuli ng catch block
        }
    }
};

app.set('transporter', transporter);
// --- END HTTP TRANSPORTER ---

// --- API Routes ---

// Public API Routes (No Auth)
app.use('/api/public/overview', overview); 
app.use('/api/public/transactions', transaction);
app.use('/api/public/documents', documents);

// --- PUBLIC HTML ROUTES ---
const publicDir = path.join(__dirname, 'templates', 'public');

// Public Layout
app.get('/public-layout.html', (req, res) => {
    res.sendFile(path.join(publicDir, '_public-layout.html'));
});

app.get('/public-footer.html', (req, res) => { 
    res.sendFile(path.join(publicDir, 'public-footer.html'));
});

// We remove the redirect and set the welcome page as the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'welcome.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'signup.html'));
});

app.get('/otp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'otp.html'));
});

app.get('/reset-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'reset-password.html'));
});

// Public Pages
app.get('/public/overview', (req, res) => {
    res.sendFile(path.join(publicDir, 'public-overview.html'));
});

app.get('/public/ledger', (req, res) => {
    res.sendFile(path.join(publicDir, 'public-TL.html'));
});

app.get('/public/documents', (req, res) => {
    res.sendFile(path.join(publicDir, 'public-documents.html'));
});

// Secure Routes
app.use('/api/budget', auth, checkRole('Admin', 'Validator'), budget);
app.use('/api/expenses', auth, checkRole('Admin', 'Validator'), expenses); 
app.use('/api/categories', auth, checkRole('Admin'), categoryRoutes);
app.use('/api/transactions', auth, checkRole('Admin', 'Validator'), transaction);
app.use('/api/documents', auth, checkRole('Admin', 'Validator'), documents);
app.use('/api/overview', auth, checkRole('Admin', 'Validator'), overview);
app.use('/api/validation', auth, checkRole('Admin', 'Validator'), validation);

app.use('/api/users', users); 

// --- HTML Page Routes ---
const adminDir = path.join(__dirname, 'templates', 'admin');

// Shared Pages
app.get('/admin/overview', auth, checkRole('Admin', 'Validator'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-overview.html'));
});

app.get('/admin/validation', auth, checkRole('Admin', 'Validator'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-VC.html'));
});

app.get('/admin/ledger', auth, checkRole('Admin', 'Validator'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-TL.html'));
});

app.get('/admin/documents', auth, checkRole('Admin', 'Validator'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-documents.html'));
});

// --- [NEW] AUDIT TRAIL VIEWER ---
app.get('/admin/view-audit-ledger', auth, checkRole('Admin', 'Validator'), (req, res) => {
    let logPath;
    if (process.env.RAILWAY_ENVIRONMENT) {
        logPath = '/app/data/blockchain_audit_ledger.txt';
    } else {
        logPath = path.join(__dirname, 'templates/blockchain_audit_ledger.txt');
    }

    if (fs.existsSync(logPath)) {
        fs.readFile(logPath, 'utf8', (err, data) => {
            if (err) return res.status(500).send("Error reading log file.");
            res.send(`
                <html>
                <body style="font-family: monospace; background: #1e1e1e; color: #00ff00; padding: 20px;">
                    <h1>📜 Blockchain Audit Ledger</h1>
                    <p style="color: #fff">This is the permanent record of all transactions.</p>
                    <textarea style="width: 100%; height: 800px; background: #000; color: #0f0; border: 1px solid #555; padding: 15px;">${data}</textarea>
                </body>
                </html>
            `);
        });
    } else {
        res.send("<h1>📜 Blockchain Audit Ledger</h1><p>No records found yet.</p>");
    }
});

// --- [NEW] AUDIT TRAIL DOWNLOADER ---
app.get('/admin/download-ledger', auth, checkRole('Admin'), (req, res) => {
    let logPath;
    if (process.env.RAILWAY_ENVIRONMENT) {
        logPath = '/app/data/blockchain_audit_ledger.txt';
    } else {
        logPath = path.join(__dirname, 'templates/blockchain_audit_ledger.txt');
    }

    if (fs.existsSync(logPath)) {
        res.download(logPath, 'OFFICIAL_AUDIT_LEDGER.txt');
    } else {
        res.status(404).send("Ledger file not found.");
    }
});

// Admin-Only Pages
app.get('/admin/budget', auth, checkRole('Admin'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-BA.html'));
});

app.get('/admin/expenses', auth, checkRole('Admin'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-RE.html'));
});

app.get('/admin/management', auth, checkRole('Admin'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-UM.html'));
});

// Shared Resources
app.get('/admin-layout.html', auth, checkRole('Admin', 'Validator'), (req, res) => {
    res.sendFile(path.join(adminDir, '_admin-layout.html'));
});
app.get('/admin-footer.html', auth, checkRole('Admin', 'Validator'), (req, res) => {
    res.sendFile(path.join(adminDir, 'admin-footer.html')); 
});

// --- TEMPORARY DOWNLOAD ROUTE ---
app.get('/admin/download-db', auth, checkRole('Admin'), (req, res) => {
    const volumePath = '/app/data/BRIGHTDatabase.db'; //changed
    const localPath = path.join(__dirname, 'data','BRIGHTDatabase.db');//changed

    const dbFile = fs.existsSync(volumePath) ? volumePath : localPath;

    if (fs.existsSync(dbFile)) {
        res.download(dbFile, 'BRIGHTDatabase_Backup.db', (err) => { //changed
            if (err) {
                console.error("Error downloading DB:", err);
                res.status(500).send("Error downloading database.");
            }
        });
    } else {
        //res.status(404).send("Database file not found.");
        // Added console log to help you debug exactly where it looked
        console.error(`❌ Download Error: File not found at ${dbFile}`);
        res.status(404).send("Database file not found.");
    }
});

// --- EXECUTE RESCUE OPERATION ---
syncUploadsToVolume(); //added

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// --- DEBUGGING ROUTE (Delete this later) ---
// Bisitahin mo ito sa: https://your-website.up.railway.app/secret-file-check
app.get('/secret-file-check', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    // Ang target na folder (Volume)
    const volumePath = '/app/data';
    
    let output = '<h1>Server Storage Check</h1>';
    
    // 1. Check Root Volume
    output += `<h3>📂 Checking: ${volumePath}</h3>`;
    try {
        if (fs.existsSync(volumePath)) {
            const files = fs.readdirSync(volumePath);
            output += `<ul>`;
            files.forEach(f => output += `<li>${f}</li>`);
            output += `</ul>`;
        } else {
            output += `<p style="color:red">❌ Volume Folder NOT Found!</p>`;
        }
    } catch (err) {
        output += `<p>Error: ${err.message}</p>`;
    }

    // 2. Check Uploads Folder
    const uploadsPath = path.join(volumePath, 'uploads');
    output += `<h3>📂 Checking: ${uploadsPath}</h3>`;
    try {
        if (fs.existsSync(uploadsPath)) {
            const files = fs.readdirSync(uploadsPath);
            if (files.length === 0) output += `<p><i>(Folder is empty)</i></p>`;
            
            output += `<ul>`;
            files.forEach(f => output += `<li>${f}</li>`);
            output += `</ul>`;
        } else {
            output += `<p style="color:orange">⚠️ Uploads folder not created yet (Normal if no uploads yet)</p>`;
        }
    } catch (err) {
        output += `<p>Error: ${err.message}</p>`;
    }
    
    // 3. Server Info
    output += `<hr><p>Server Time: ${new Date().toString()}</p>`;
    
    res.send(output);
});

// --- SECRET TESTING ZONE (Start) ---
// I-import ang upload middleware mo
const uploadMiddleware = require('./middleware/upload');

// 1. Ang Secret Form (Dito ka mag-uupload)
app.get('/secret-upload-test', (req, res) => {
    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 50px; text-align: center;">
                <h1>🕵️ Secret Storage Tester</h1>
                <p>This uploads to the Server Volume ONLY. No Database record.</p>
                <form action="/secret-upload-test" method="post" enctype="multipart/form-data">
                    <input type="file" name="supportingDocuments" required>
                    <br><br>
                    <button type="submit" style="padding: 10px 20px; cursor: pointer;">Test Upload</button>
                </form>
            </body>
        </html>
    `);
});

// 2. Ang Process (Dito isasave sa Volume at ibibigay ang Link)
app.post('/secret-upload-test', uploadMiddleware, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.send('❌ Upload Failed: No file received.');
    }

    const file = req.files[0]; // Kunin ang unang file
    
    // Ito yung fix na ginawa natin kanina (Web Path)
    const webPath = '/uploads/' + file.filename;

    res.send(`
        <html>
            <body style="font-family: sans-serif; padding: 50px; text-align: center;">
                <h1 style="color: green;">✅ Upload Successful!</h1>
                <p>File saved to Volume: <b>${file.filename}</b></p>
                <hr>
                <h3>Testing "View" & "Download":</h3>
                <p>Click the link below. If you see the image, FIXED NA ANG SERVER.</p>
                
                <a href="${webPath}" target="_blank" style="font-size: 24px; font-weight: bold; color: blue;">
                    👁️ VIEW DOCUMENT HERE
                </a>
                
                <br><br>
                <a href="/secret-upload-test">Test Another File</a>
            </body>
        </html>
    `);
});
// --- SECRET TESTING ZONE (End) ---