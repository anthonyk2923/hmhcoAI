async function send(message) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  const response = await chrome.tabs.sendMessage(tab.id, message);
}

document.addEventListener('DOMContentLoaded', function () {
  let startButton = document.getElementById('startButton');
  let stopButton = document.getElementById('stopButton');
  let clearButton = document.getElementById('clearButton');
  let helpButton = document.getElementById('helpButton');

  startButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          message: 'startButton',
        },
        function (response) {}
      );
    });
    // startButton.style.display = 'none';
    // stopButton.style.display = 'block';
  });
  stopButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          message: 'stopButton',
        },
        function (response) {
          navigator.clipboard.writeText(response.message);
          alert('Successfully took notes and copied to clipboard!');
        }
      );
    });
    // startButton.style.display = 'block';
    // stopButton.style.display = 'none';
  });
  clearButton.addEventListener('click', () => {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      for (let tab of tabs) {
        if (tab.url.includes('your-tab-url-pattern')) {
          chrome.tabs.sendMessage(
            tab.id,
            {
              message: 'clearButton',
            },
            function (response) {}
          );
          break; // Stop iterating once you've found the tab
        }
      }
    });
    navigator.clipboard.writeText('');
  });
  helpButton.addEventListener('click', () => {
    alert(
      "Before starting click 'Clear'. \n\n Then go through every page and click 'capture'. \n\n Once you have all the pages, click done!"
    );
  });
});
