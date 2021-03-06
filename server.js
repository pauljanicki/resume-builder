var express = require('express');
var path = require('path');
var app = express();
var pdf = require('html-pdf');
var bodyParser = require('body-parser');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

// Create link to Webapp build directory
var distDir = __dirname + '/dist/';
app.use(express.static(distDir));
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

app.put('/pdf', (req, res) => {
  var options = { format: 'A4' };

  postcss([ autoprefixer() ]).process(req.body.css, { from: undefined }).then(function (result) {
    var template = createTemplate(result.css, req.body.html);

    pdf.create(template, options).toBuffer(function(err, buffer) {
      if (err) {
        console.log(err);
        res.err('PDF creation failed');
        return;
      }
  
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=some_file.pdf',
        'Content-Length': buffer.length
      });
      res.end(new Buffer.from(buffer, 'binary'));
    });
  });
});

function createTemplate(style, html) {
  return `<html>
  <head>
    <meta charset="utf8">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css" />
    <style>
      ${style}
    </style>
  </head>
  <body>
    ${html}
  </body>
  </html>
  `;
}

app.listen(PORT, () => {console.log(`Listening on port ${PORT}...`);});
