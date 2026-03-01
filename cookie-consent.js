(() => {
  const CONSENT_KEY = 'cookieConsent';
  const CONSENT_COOKIE = 'cookie_consent';
  const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

  function getStoredConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return null;
    }
  }

  function setStoredConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
    }
    document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${ONE_YEAR_SECONDS}`;
  }

  function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .cookie-banner {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: 16px;
        z-index: 9999;
        background: #ffffff;
        color: #1f2933;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        border: 1px solid #e0e0e0;
      }
      .cookie-banner__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .cookie-banner__text {
        font-size: 14px;
        line-height: 1.4;
        max-width: 640px;
      }
      .cookie-banner__actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .cookie-banner__button {
        border: none;
        border-radius: 8px;
        padding: 10px 16px;
        font-weight: 600;
        cursor: pointer;
      }
      .cookie-banner__button--accept {
        background: #4caf50;
        color: #ffffff;
      }
      .cookie-banner__button--decline {
        background: #e5e7eb;
        color: #111827;
      }
      @media (max-width: 520px) {
        .cookie-banner {
          left: 12px;
          right: 12px;
          bottom: 12px;
          padding: 14px 16px;
        }
        .cookie-banner__content {
          align-items: stretch;
        }
        .cookie-banner__actions {
          width: 100%;
          justify-content: space-between;
        }
        .cookie-banner__button {
          flex: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');

    const content = document.createElement('div');
    content.className = 'cookie-banner__content';

    const text = document.createElement('div');
    text.className = 'cookie-banner__text';
    text.textContent = 'We use essential cookies to keep you signed in. By clicking “Accept”, you agree to their use.';

    const actions = document.createElement('div');
    actions.className = 'cookie-banner__actions';

    const acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'cookie-banner__button cookie-banner__button--accept';
    acceptBtn.textContent = 'Accept';

    const declineBtn = document.createElement('button');
    declineBtn.type = 'button';
    declineBtn.className = 'cookie-banner__button cookie-banner__button--decline';
    declineBtn.textContent = 'Decline';

    actions.appendChild(acceptBtn);
    actions.appendChild(declineBtn);
    content.appendChild(text);
    content.appendChild(actions);
    banner.appendChild(content);

    acceptBtn.addEventListener('click', () => {
      setStoredConsent('accepted');
      banner.remove();
    });

    declineBtn.addEventListener('click', () => {
      setStoredConsent('declined');
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  if (getStoredConsent()) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createStyles();
      createBanner();
    });
  } else {
    createStyles();
    createBanner();
  }
})();

