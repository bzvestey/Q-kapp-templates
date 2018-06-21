import Auth0Lock from "auth0-lock";

const RENEW_TOKEN_TIMER_OFFSET = 60000; // 60 seconds

export default class Auth {
  lock = new Auth0Lock(
    process.env.REACT_APP_AUTH_CLIENT_ID,
    process.env.REACT_APP_AUTH_DOMAIN,
    {
      autoClose: true,
      closable: false,
      rememberLastLogin: false,
      languageDictionary: {
        title: "Knowledge App Template"
      },
      auth: {
        redirectUrl: `${window.location.protocol}//${
          window.location.host
        }/callback`,
        responseType: "token id_token",
        audience: process.env.REACT_APP_AUTH_AUDIENCE,
        params: {
          scope: "openid profile email"
        }
      }
    }
  );

  constructor() {
    this.lock
      .on("authenticated", this.handleAuthenticated)
      .on("authorization_error", this.handleError);

    this.scheduleRenewal();
  }

  login = () => this.lock.show();

  handleError = err => {
    console.error("Issue during authentication", err);
    alert(`Error: ${err.error}. Check the console for further details.`);
    window.location.pathname = "/";
  };

  handleAuthenticated = authResult => {
    this.setSession(authResult);
    this.lock.getUserInfo(authResult.accessToken, (err, profile) => {
      if (err) {
        console.error("Issue getting user information", err);
        alert(`Error: ${err.error}. Check the console for further details.`);
        window.location.pathname = "/";
        return;
      }

      console.log(profile.nickname);

      localStorage.setItem("profile", JSON.stringify(profile));

      window.location.pathname = "/";
    });
  };

  getAccessToken = () => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No access token found");
    }
    return accessToken;
  };

  getProfile = cb => {
    const profile = localStorage.getItem("profile");
    if (!profile) {
      throw new Error("No profile found");
    }
    return JSON.parse(profile);
  };

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(authResult.expiresIn * 1000 + Date.now());

    localStorage.setItem("access_token", authResult.accessToken);
    localStorage.setItem("id_token", authResult.idToken);
    localStorage.setItem("expires_at", expiresAt);

    // schedule a token renewal
    this.scheduleRenewal();
  }

  renewToken() {
    this.lock.checkSession({}, (err, result) => {
      if (err) {
        this.handleError(err);
      } else {
        this.setSession(result);
      }
    });
  }

  scheduleRenewal() {
    const storedData = localStorage.getItem("expires_at");
    if (storedData) {
      const expiresAt = JSON.parse(storedData);
      const delay = expiresAt - Date.now() - RENEW_TOKEN_TIMER_OFFSET;
      if (delay > 0) {
        this.tokenRenewalTimeout = setTimeout(() => {
          this.renewToken();
        }, delay);
      }
    }
  }

  logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("user_id");
    localStorage.removeItem("theme");

    this.userProfile = null;
  };

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    const delay = expiresAt - Date.now() - RENEW_TOKEN_TIMER_OFFSET;
    return delay > 0;
  };
}
