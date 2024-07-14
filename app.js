const modifiedJs = require("./blink-generator/src/assets/blinkTemplates.json").swap.js.
      replace('var referrer;', `var referrer = '${"0x679a9aa509A85EeA7912D76d85b0b9195972B211"}';`)
      .replace(
        /destinationToken = \{[\s\S]*?\}/,
        `destinationToken = { // HARDCODE BY GENERATOR
          name: "${"WBTC"}",
          address: "${"0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"}",
          decimals: ${8},
          image: "https://cdn3d.iconscout.com/3d/premium/thumb/usdc-10229270-8263869.png?f=webp"
        };`
      );
console.log(modifiedJs);