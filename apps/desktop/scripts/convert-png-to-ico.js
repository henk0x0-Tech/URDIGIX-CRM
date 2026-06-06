const fs = require('fs');

function convertPngToIco(pngPath, icoPath) {
  const pngBuffer = fs.readFileSync(pngPath);
  const size = pngBuffer.length;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: ICO
  header.writeUInt16LE(1, 4); // Number of images: 1

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // Width: 256 (0 means 256)
  entry.writeUInt8(0, 1); // Height: 256 (0 means 256)
  entry.writeUInt8(0, 2); // Color palette: 0
  entry.writeUInt8(0, 3); // Reserved
  entry.writeUInt16LE(1, 4); // Color planes: 1
  entry.writeUInt16LE(32, 6); // Bits per pixel: 32
  entry.writeUInt32LE(size, 8); // Size of the PNG data
  entry.writeUInt32LE(22, 12); // Offset: 22

  const icoBuffer = Buffer.concat([header, entry, pngBuffer]);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Converted ${pngPath} to ${icoPath}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node convert-png-to-ico.js <src.png> <dest.ico>');
  process.exit(1);
}
convertPngToIco(args[0], args[1]);
