const Table = require("./../models/tableModel");
const catchAsync = require("./../utils/catchAsync");
const { convertArrayToCSV } = require("convert-array-to-csv");
const fastCsv = require("fast-csv");
const nodemailer = require("nodemailer");
const { Writable } = require("stream");

exports.newTable = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const table = await Table.create(req.body);
  res.status(200).json(table);
});

exports.updateTable = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const tables = await Table.updateMany(
    {
      _id: {
        $in: req.body.ids,
      },
    },

    req.body
  );

  const ts = await Table.find();
  res.status(200).json(ts);
});

exports.deleteTable = catchAsync(async (req, res, next) => {
  const tables = await Table.deleteMany({
    _id: {
      $in: req.body.ids,
    },
  });
  res.status(201).json(tables);
});

exports.getAllTables = catchAsync(async (req, res, next) => {
  const tables = await Table.find();
  res.status(201).json(tables);
});

exports.getTableCSVData = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your email service
    auth: {
      user: "amolverma.246@gmail.com",
      pass: "yhdf dztq glhy rnhv",
    },
  });
  const tables = await Table.find({
    _id: {
      $in: req.body.ids,
    },
  });
  const tableRows = tables
    .map(
      (table) => `
    <tr>
      <td>${table._id}</td>
      <td>${table.name}</td>
      <td>${table.phone}</td>
      <td>${table.email}</td>
      <td>${table.hobbies.join(", ")}</td>
    </tr>
  `
    )
    .join("");
  const cursor = Table.find().cursor();
  const transformer = (doc) => ({
    Id: doc._id.toString(),
    Name: doc.name,
    Email: doc.email,
    Phone: doc.phone,
    Hobbies: doc.hobbies.join(", "), // Assuming hobbies is an array
  });

  // Writable stream to capture CSV data
  const csvDataChunks = [];
  const writableStream = new Writable({
    write(chunk, encoding, callback) {
      csvDataChunks.push(chunk);
      callback();
    },
  });

  writableStream.on("finish", () => {
    // Once all data is captured, send it via email
    const csvData = Buffer.concat(csvDataChunks); // Combine all chunks
    const mailOptions = {
      from: "amolverma.246@gmail.com",
      to: [
        "amilbcahat@gmail.com",
        "amolverma.246@gmail.com",
        "info@redpositive.in",
      ],
      subject: "Data of The Selected Rows !",
      html: `<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .email-container { padding: 20px; }
                h1 { color: #333; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .data-table th { background-color: #4CAF50; color: white; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <h1>Your Data !</h1>
                <p>Dear team,</p>
                <p>Please find below the data from the selected rows !</p>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Hobbies</th>
                        </tr>
                    </thead>
                   ${tableRows}

                </table>

                <p>This email is generated as part of the full-stack coding task utilizing MongoDB, Node.js, Express.js, Next.js, and Tailwind CSS.</p>
                <p>Best regards,</p>
                <p>Amol Verma</p>
            </div>
        </body>
        </html>
        `,
      attachments: [
        {
          filename: "export.csv",
          content: csvData,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      res.status(200).json({
        status: "success",
        message_id: info.messageId,
      });
    });
  });

  const csvStream = fastCsv.format({ headers: true }).transform(transformer);
  cursor.pipe(csvStream).pipe(writableStream);
});
