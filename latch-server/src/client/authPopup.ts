function getWindowOpts(): {[key: string]: number} {
  const windowWidth = Math.min(800, Math.floor(window.outerWidth * 0.8));
  const windowHeight = Math.min(630, Math.floor(window.outerHeight * 0.5));
  const windowArea = {
    width: windowWidth,
    height: windowHeight,
    left: Math.round(window.screenX + (window.outerWidth - windowWidth) / 2),
    top: Math.round(window.screenY + (window.outerHeight - windowHeight) / 8),
  };

  // TODO: figure out how to show the toolbar icons in the window for password managers
  return {
    width: windowArea.width,
    height: windowArea.height,
    left: windowArea.left,
    top: windowArea.top,
    toolbar: 0,
    scrollbars: 1,
    status: 1,
    resizable: 1,
    menuBar: 0,
  };
}

const spinner = `<svg width="2.25rem" height="2.25rem" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#228be6" role="presentation">
  <g fill="none" fill-rule="evenodd">
    <g transform="translate(2.5 2.5)" stroke-width="5">
      <circle stroke-opacity=".5" cx="16" cy="16" r="16"></circle>
      <path d="M32 16c0-9.94-8.06-16-16-16">
        <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="1s" repeatCount="indefinite"></animateTransform>
      </path>
    </g>
  </g>
</svg>`;

function createAuthWindow(): Window | null {
  const windowOpts = getWindowOpts();
  const w = window.open(
    '/oauth/start',
    // A unqiue name prevents orphaned popups from stealing our window.open
    `google_${Math.random()}`.replace('.', ''),
    Object.keys(windowOpts)
      .map((k) => `${k}=${windowOpts[k]}`)
      .join(','),
  );
  if (w && w.document) {
    try {
      w.document.title = `Log in with Google`;
      w.document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;height:100vh;width:100vw%">${spinner}</div>`;
    } catch (e) {}
  }
  return w;
}

class AuthNotify extends EventTarget {
  notifyLoggedOut() {
    this.dispatchEvent(new Event('logout'));
  }
  notifyLoggedIn() {
    this.dispatchEvent(new Event('login'));
  }
}

export const authNotify = new AuthNotify();

const state: {window?: Window; messageListener?: any} = {};

function cleanup() {
  if (state.messageListener) {
    window.removeEventListener('message', state.messageListener, false);
    state.messageListener = undefined;
  }

  if (state.window) {
    state.window.close();
    state.window = undefined;
  }
}

function waitForMessage(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    function parseEvent(event: MessageEvent<any>) {
      try {
        return JSON.parse(event.data);
      } catch (e) {
        return {};
      }
    }
    const listener = (event: MessageEvent<any>) => {
      console.log('event', event);
      const message = parseEvent(event);
      if (message.error) {
        reject(new Error(message.error));
      } else {
        authNotify.notifyLoggedIn();
        resolve();
      }
    };
    state.messageListener = listener;
    window.addEventListener('message', listener, false);
  });
}

export async function login() {
  cleanup();
  const authWindow = createAuthWindow();
  if (!authWindow) {
    return new Error('Could not open auth popup');
  }
  state.window = authWindow;
  try {
    await waitForMessage();
  } catch (e) {
    throw e;
  } finally {
    cleanup();
  }
}
