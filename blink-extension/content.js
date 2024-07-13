// Function to inject a script into the page context
function injectScript(code) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.onload = function () {
    script.remove();
  };
}


const makeid = () => {
  return Math.floor(Math.random() * 100000000)
}

function updateIds(htmlString, number) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const elementsWithId = tempDiv.querySelectorAll('[id]');
  elementsWithId.forEach(element => {
    element.id += number;
  });

  const styleTags = tempDiv.querySelectorAll('style');
  styleTags.forEach(styleTag => {
    styleTag.innerHTML = styleTag.innerHTML.replace(/#(\w+)\s*\{/g, (match, id) => {
      return `#${id}${number}{`;
    });
  });

  return tempDiv.innerHTML;
}

function updateIdsInJsCode(jsCode, number) {
  return jsCode.replace(/getElementById\s*\(\s*(['"`])(\w+)\1\s*\)/g, (match, quote, id) => {
    return `getElementById(${quote}${id}${number}${quote})`;
  });
}

// Function to fetch HTML content from a URL and replace <blk and blk> tags
async function replaceBlkTags() {
  // Find all span elements containing <blk ... blk> or &lt;blk ... blk&gt;
  const spans = document.querySelectorAll('span');

  const fetchPromises = [];
  spans.forEach(span => {
    const blkRegex = /(&lt;|<)blk\s*(.*?)\s*blk(&gt;|>)/g;
    const match = blkRegex.exec(span.innerHTML);

    if (match) {
      let url = null;
      const url1 = match[2].trim();

      if (url1.startsWith("http"))
        url = url1;
      else if (url1.startsWith("ipfs://"))
        url = "https://ipfs.io/ipfs/" + url1.substring("ipfs://".length);

      console.log(`Fetching URL: ${url}`);  // Debugging information
      if (!url)
        return;

      fetchPromises.push(
        fetch(url)
          .then(response => {
            if (response.ok) {
              return response.json().then(result => {
                const { html, js } = result.iframe;
                return { span, htmlText: html, jsCode: js };
              });
            } else {
              console.error(`Failed to fetch ${url}: ${response.statusText}`);
              return null;
            }
          })
          .catch(error => {
            console.error(`Error fetching ${url}:`, error);
            return null;
          })
      );
    }
  });

  const results = await Promise.all(fetchPromises);

  results.forEach(result => {
    if (result) {
      const parentDiv = result.span.closest('div');
      if (parentDiv) {
        const randomNumber = makeid();
        const tempDiv = document.createElement('div');
        const newHtml = updateIds(result.htmlText, randomNumber);
        tempDiv.innerHTML = newHtml

        console.log("DO REPLACE");
        parentDiv.replaceWith(...tempDiv.childNodes);

        setTimeout(() => {
          const newJS = updateIdsInJsCode(result.jsCode, randomNumber);
          injectScript(newJS);
        }, 200);
      }
    }
  });
}

(function () {
  const script = document.createElement('script');
  script.src = 'https://cdn.ethers.io/lib/ethers-5.2.umd.min.js';
  script.onload = function () {
    // You can put additional code here if needed to run after ethers is loaded
  };
  document.head.appendChild(script);
})();

// Run the function every 1 second
setInterval(replaceBlkTags, 1000);