class Controller {
  constructor() {
    this._registerServiceWorker();
    this._dbPromise = this._openDatabase();
    this._showCachedNews();
    this._makeRequest(5);
  }

  // register service worker
  _registerServiceWorker() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('Service worker registered');
        })
        .catch(e => {
          console.log('Service worker registertion failed');
        });
    }
  }

  // open indexedDB database
  _openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('news-bits', 1, function(upgradeDb) {
      var store = upgradeDb.createObjectStore('news', {
        keyPath: 'id'
      });
      store.createIndex('by-date', 'date');
    });
  }

  // get content from indexedDB
  _showCachedNews() {
    let Controller = this;
    this._dbPromise.then(function(db) {
      if (!db) return;

      var tx = db
        .transaction('news')
        .objectStore('news')
        .index('by-date');
      return tx.getAll().then(function(news) {
        Controller._addContent(news);
      });
    });
  }

  // make a request to the server for content
  _makeRequest(num = 1) {
    let Controller = this;
    $.ajax({
      url: `/content/${num}`,
      type: 'GET',
      success: response => {
        Controller._addContent(response.data);
      },
      error: () => {
        Controller._showToast('Could not connect to the internet');
      }
    });
  }

  // add new content to the page
  _addContent(content) {
    let contentBox = $('#contentBox');

    // before adding content to the page, store indexedDB
    this._dbPromise.then(function(db) {
      if (!db) return;

      var tx = db.transaction('news', 'readwrite');
      var store = tx.objectStore('news');
      content.forEach(function(item) {
        store.put(item);
      });

      // limit store to 30 items
      store
        .index('by-date')
        .openCursor(null, 'prev')
        .then(function(cursor) {
          return cursor.advance(20);
        })
        // limit data in indexedDB to 30
        .then(function deleteRest(cursor) {
          if (!cursor) return;
          cursor.delete();
          return cursor.continue().then(deleteRest);
        });
    });

    content.forEach(element => {
      let newContent = `<div class="demo-card-wide mdl-card mdl-shadow--2dp">
                        <div class="mdl-card__title">
                          <h2 class="mdl-card__title-text">${element.title}</h2>
                        </div>
                        <div class="mdl-card__supporting-text">
                        ${element.text}
                        </div>
                        <div class="mdl-card__actions">
                          <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                            ${element.date}
                          </a>
                        </div>
                      </div>
                    `;
      contentBox.html(contentBox.html() + newContent);
    });
  }

  _showToast(text) {
    let snackbarContainer = document.querySelector('#snackbar');

    snackbarContainer.innerHTML = text;
    // Add the "show" class to DIV
    snackbarContainer.classList.toggle('show');

    // After 3 seconds, remove the show class from DIV
    setTimeout(function() {
      snackbarContainer.className = snackbarContainer.classList.toggle('show');
    }, 10000);
  }
}
