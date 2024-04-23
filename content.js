console.log('loaded content');
title = '';
text = '';

function normalizeEmptyLines(inputString) {
  const lines = inputString.split('\n');

  const trimmedLines = lines.map((line) => line.trim());

  let result = trimmedLines.join('\n');

  result = result.replace(/([^\.\?\!])\n([a-z])/gi, '$1 $2');

  return result;
}

function captureNotes() {
  console.log('caputureNotes Ran');
  text = '';
  title = '';

  const url = document.querySelector('iframe[data-engine]').src;
  console.log(url);
  fetch(url)
    .then(function (response) {
      switch (response.status) {
        // status "OK"
        case 200:
          return response.text();
        // status "Not Found"
        case 404:
          console.log(response);
          throw response;
      }
    })
    .then(function (template) {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(template, 'text/html');
      const elements = htmlDoc.querySelectorAll('*');
      elements.forEach(function (element) {
        if (element.tagName === 'P') {
          if (element.innerHTML.length > 199) {
            const firstSentence = removeTags(element.innerHTML)
              .split('. ')
              .shift();
            if (firstSentence.length >= 25) {
              text += `- ${firstSentence}\n`;
            }
          }
        }
        if (element.tagName === 'H2') {
          if (
            element.closest('section.segment-opener-ah') ||
            element.closest('section.segment-opener')
          ) {
            title = removeTags(element.innerHTML);
          }
        }
      });
      if (title && text) {
        text = `${title}\n${text}\n`;
      } else if (title && text.length < 30) {
        text = ``;
      } else {
        text = `\n${text}`;
      }
      title = '';
      localStorage.setItem(
        'allNotes',
        normalizeEmptyLines(
          `${localStorage.getItem('allNotes') || ''}\n${text}`
        )
      );
      return text;
    })
    .catch(function (response) {
      console.log(response.statusText);
    });
}

function stopRecording() {
  console.log('Recording stopped');
  console.log(localStorage.getItem('allNotes'));

  let notes = localStorage.getItem('allNotes');
  localStorage.setItem('allNotes', '');
  return notes;
}

window.onbeforeunload = () => {
  return null;
};

function removeTags(str) {
  if (str === null || str === '') return false;
  else str = str.toString();

  return str.replace(/(<([^>]+)>)/gi, '');
}

// document.addEventListener('DOMContentLoaded', function () {
document.onreadystatechange = function () {
  console.log('Content script loaded');

  if (localStorage.getItem('allNotes') == null) {
    localStorage.setItem('allNotes', '');
  }
};
// });
chrome.runtime.onMessage.addListener(
  // this is the message listener
  function (request, sender, sendResponse) {
    if (request.message === 'startButton') {
      captureNotes();
      console.log('capturing');
    }
    if (request.message === 'stopButton') {
      let responseNotes = stopRecording();
      console.log('stoping');
      console.log(responseNotes);
      sendResponse({ message: responseNotes });
    }
    if (request.message === 'clearButton') {
      localStorage.setItem('allNotes', '');
      console.log('Clearing');
    }
  }
);
