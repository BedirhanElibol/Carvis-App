const Jimp = require('jimp');

async function cropLogo() {
  try {
    const image = await Jimp.read('src/assets/logo.png');
    image.autocrop();
    await image.writeAsync('src/assets/logo_cropped.png');
    console.log('Successfully cropped the image.');
  } catch (error) {
    console.error('Error:', error);
  }
}

cropLogo();
