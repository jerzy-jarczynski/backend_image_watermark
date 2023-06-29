const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textData = {
    text: text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  };

  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  await image.quality(100).writeAsync(outputFile);
};

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5,
  });
  await image.quality(100).writeAsync(outputFile);
};

const prepareOutputFilename = (filename) => {
  const [ name, ext ] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

const makeImageBrighter = async (inputFile, outputFile, brightnessValue) => {
  try {
    // Read the image using Jimp
    const image = await Jimp.read(inputFile);

    // Adjust the brightness of the image
    image.brightness(brightnessValue);

    // Save the modified image to the output path
    await image.writeAsync(outputFile);

    console.log('Image brightness adjusted successfully.');
  } catch (error) {
    console.error('Error adjusting image brightness:', error);
  }
};

const increaseImageContrast = async (inputFile, outputFile, contrastValue) => {
  try {
    // Read the image using Jimp
    const image = await Jimp.read(inputFile);

    // Adjust the contrast of the image
    image.contrast(contrastValue);

    // Save the modified image to the output path
    await image.writeAsync(outputFile);

    console.log('Image contrast increased successfully.');
  } catch (error) {
    console.error('Error increasing image contrast:', error);
  }
};

const convertToBlackAndWhite = async (inputFile, outputFile) => {
  try {
    // Read the image using Jimp
    const image = await Jimp.read(inputFile);

    // Convert the image to black and white (grayscale)
    image.greyscale();

    // Save the modified image to the output path
    await image.writeAsync(outputFile);

    console.log('Image converted to black and white successfully.');
  } catch (error) {
    console.error('Error converting image to black and white:', error);
  }
};

const invertImage = async (inputFile, outputFile) => {
  try {
    // Read the image using Jimp
    const image = await Jimp.read(inputFile);

    // Invert the colors of the image
    image.invert();

    // Save the modified image to the output path
    await image.writeAsync(outputFile);

    console.log('Image colors inverted successfully.');
  } catch (error) {
    console.error('Error inverting image colors:', error);
  }
};

const startApp = async () => {

  // Ask if user is ready
  const answer = await inquirer.prompt([{
      name: 'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }]);

  // if answer is no, just quit the app
  if(!answer.start) process.exit();

  // ask about input file and watermark type
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }, {
    name: 'modifyImage',
    type: 'confirm',
    message: 'Do you want to modify image?',
  }, {
    name: 'imageModifier',
    type: 'list',
    choices: [
      'Make image brighter',
      'Increase contrast',
      'Make image B&W',
      'Invert image',
    ],
    when: (answers) => answers.modifyImage === true,
  }, {
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

  if (options.modifyImage === true) {
    switch (options.imageModifier) {
      case 'Make image brighter':
        try {
          makeImageBrighter(
            './img/' + options.inputImage,
            './img/' + options.inputImage,
            0.5
          );
          break;
        } catch (error) {
          console.log('\nSomething went wrong while making the image brighter. Try again.\n');
        }
      case 'Increase contrast':
        try {
          increaseImageContrast(
            './img/' + options.inputImage,
            './img/' + options.inputImage,
            0.5
          );
          break;
        } catch (error) {
          console.log('\nSomething went wrong while increasing the image contrast. Try again.\n');
        }
      case 'Make image B&W':
        try {
          convertToBlackAndWhite(
            './img/' + options.inputImage,
            './img/' + options.inputImage
          );
          break;
        } catch (error) {
          console.log('\nSomething went wrong while converting the image to black and white. Try again.\n');
        }
      case 'Invert image':
        try {
          invertImage(
            './img/' + options.inputImage,
            './img/' + options.inputImage
          );
          break;
        } catch (error) {
          console.log('\nSomething went wrong while inverting the image. Try again.\n');
        }
      default:
        console.log('Unknown action');
    }
  }

  if(options.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }])

    options.watermarkText = text.value;

    if (fs.existsSync('./img/' + options.inputImage)) {
      try {
        addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText);
        console.log('\nWatermark added successfully\n');
        startApp();
      } catch(error) {
        console.log('\nSomething went wrong... Try again\n');
      }
    } else {
      console.log('\nSomething went wrong... Try again\n');
    }
  }
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
    }])
    options.watermarkImage = image.filename;

    if (fs.existsSync('./img/' + options.inputImage)
     && fs.existsSync('./img/' + options.watermarkImage)) {
      try {
        addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage);
        console.log('\nWatermark added successfully\n');
        startApp();
      } catch(error) {
        console.log('\nSomething went wrong... Try again\n');
      }
    } else {
      console.log('\nSomething went wrong... Try again\n');
    }
  }

};

startApp();